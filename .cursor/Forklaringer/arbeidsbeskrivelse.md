# Email Verification Implementation Guide
## Resend + Next.js + MongoDB

### Oversikt

Denne guiden implementerer email-verifisering for både brukerregistrering og nyhetsbrev-påmelding i ditt eksisterende Next.js-prosjekt. Løsningen bruker Resend for email-sending, MongoDB for lagring, og følger best practices for sikkerhet.

## Arkitektur

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js    │    │   MongoDB       │
│                 │    │   API Routes │    │                 │
│ • Register Form │───▶│ • /api/auth/ │───▶│ • users         │
│ • Newsletter    │    │ • /api/news/ │    │ • newsletter    │
│ • Verify Pages  │    │ • Resend     │    │ • tokens        │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## Database Schema

### 1. Users Collection (eksisterende: `fargeleggingsapp.users`)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed
  role: String,
  emailVerified: Boolean, // NY FIELD
  emailVerificationToken: String, // NY FIELD
  emailVerificationTokenExpires: Date, // NY FIELD
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Newsletter Subscribers (eksisterende: `newsletter.subscribers`)
```javascript
{
  _id: ObjectId,
  email: String,
  isVerified: Boolean, // NY FIELD
  verificationToken: String, // NY FIELD
  verificationTokenExpires: Date, // NY FIELD
  subscribedAt: Date,
  verifiedAt: Date, // NY FIELD
  unsubscribeToken: String // NY FIELD
}
```

### 3. Verification Tokens (ny collection: `fargeleggingsapp.verification_tokens`)
```javascript
{
  _id: ObjectId,
  email: String,
  token: String,
  type: String, // 'user_verification' eller 'newsletter_verification'
  expiresAt: Date,
  used: Boolean,
  createdAt: Date
}
```

## 1. Miljøvariabler Setup

Legg til i `.env.local`:

```bash
# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Email settings
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME="Fargelegg Nå"

# Base URL for verification links
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Token settings
EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS=24
NEWSLETTER_VERIFICATION_TOKEN_EXPIRES_HOURS=72
```

## 2. Installer Pakker

```bash
npm install resend uuid crypto
npm install --save-dev @types/uuid
```

## 3. Email Templates

Opprett `src/lib/email-templates.ts`:

```typescript
export interface EmailTemplateProps {
  verificationUrl: string;
  userName?: string;
  emailAddress: string;
}

export const userVerificationTemplate = ({ verificationUrl, userName, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft din e-postadresse - Fargelegg Nå',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Velkommen til Fargelegg Nå!</h1>
        <p>Hei ${userName || 'der'},</p>
        <p>Takk for at du registrerte deg på Fargelegg Nå! For å fullføre registreringen, vennligst bekreft din e-postadresse ved å klikke på lenken nedenfor:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Bekreft e-postadresse
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Hvis du ikke kan klikke på knappen, kopier og lim inn denne lenken i nettleseren din:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Denne lenken utløper om 24 timer. Hvis du ikke registrerte deg på Fargelegg Nå, kan du ignorere denne e-posten.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 Fargelegg Nå. Alle rettigheter reservert.</p>
      </div>
    `
  };
};

export const newsletterVerificationTemplate = ({ verificationUrl, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft nyhetsbrev-abonnement - Fargelegg Nå',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Bekreft ditt nyhetsbrev-abonnement</h1>
        <p>Hei!</p>
        <p>Du har meldt deg på vårt nyhetsbrev med e-postadressen <strong>${emailAddress}</strong>.</p>
        <p>For å bekrefte abonnementet og begynne å motta våre oppdateringer, klikk på lenken nedenfor:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Bekreft abonnement
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Hvis du ikke kan klikke på knappen, kopier og lim inn denne lenken i nettleseren din:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Denne lenken utløper om 72 timer. Hvis du ikke meldte deg på vårt nyhetsbrev, kan du ignorere denne e-posten.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 Fargelegg Nå. Alle rettigheter reservert.</p>
      </div>
    `
  };
};
```

## 4. Email Service

Opprett `src/lib/email-service.ts`:

```typescript
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from './db';
import { userVerificationTemplate, newsletterVerificationTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailOptions {
  email: string;
  type: 'user_verification' | 'newsletter_verification';
  userName?: string;
}

export class EmailService {
  private static async generateVerificationToken(email: string, type: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    
    if (type === 'user_verification') {
      expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS || '24'));
    } else {
      expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.NEWSLETTER_VERIFICATION_TOKEN_EXPIRES_HOURS || '72'));
    }

    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    await db.collection('verification_tokens').insertOne({
      email,
      token,
      type,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    return token;
  }

  static async sendUserVerificationEmail({ email, userName }: { email: string; userName?: string }) {
    try {
      const token = await this.generateVerificationToken(email, 'user_verification');
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
      
      const template = userVerificationTemplate({ 
        verificationUrl, 
        userName, 
        emailAddress: email 
      });

      const result = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: template.subject,
        html: template.html,
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('Failed to send user verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async sendNewsletterVerificationEmail({ email }: { email: string }) {
    try {
      const token = await this.generateVerificationToken(email, 'newsletter_verification');
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-newsletter?token=${token}`;
      
      const template = newsletterVerificationTemplate({ 
        verificationUrl, 
        emailAddress: email 
      });

      const result = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: template.subject,
        html: template.html,
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('Failed to send newsletter verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async verifyToken(token: string, type: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const client = await clientPromise;
      const db = client.db('fargeleggingsapp');
      
      const tokenDoc = await db.collection('verification_tokens').findOne({
        token,
        type,
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenDoc) {
        return { valid: false };
      }

      // Mark token as used
      await db.collection('verification_tokens').updateOne(
        { _id: tokenDoc._id },
        { $set: { used: true, usedAt: new Date() } }
      );

      return { valid: true, email: tokenDoc.email };
    } catch (error) {
      console.error('Failed to verify token:', error);
      return { valid: false };
    }
  }
}
```

## 5. Oppdater User Registration API

Modifiser `src/app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Existing validation...
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Manglende påkrevde felt' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Passordet må være minst 8 tegn' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    const usersCollection = db.collection('users');

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'E-postadressen er allerede i bruk' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Create user with emailVerified: false
    const newUser = {
      _id: new ObjectId(),
      name,
      email,
      password: hashedPassword,
      role: 'user' as const,
      emailVerified: false, // NEW FIELD
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteIds: []
    };

    await usersCollection.insertOne(newUser);

    // Send verification email
    try {
      await EmailService.sendUserVerificationEmail({ email, userName: name });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    const { password: _pwd, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { 
        message: 'Bruker registrert. Sjekk e-posten din for bekreftelseslenke.', 
        user: userWithoutPassword,
        requiresVerification: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registreringsfeil:', error);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
```

## 6. Ny Email Verification API

Opprett `src/app/api/verify-email/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import clientPromise from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token er påkrevd' },
        { status: 400 }
      );
    }

    const verification = await EmailService.verifyToken(token, 'user_verification');

    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { message: 'Ugyldig eller utløpt token' },
        { status: 400 }
      );
    }

    // Update user as verified
    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    const result = await db.collection('users').updateOne(
      { email: verification.email },
      { 
        $set: { 
          emailVerified: true, 
          emailVerifiedAt: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationTokenExpires: ""
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Bruker ikke funnet' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'E-post bekreftet! Du kan nå logge inn.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
```

## 7. Newsletter API

Opprett `src/app/api/newsletter/subscribe/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { EmailService } from '@/lib/email-service';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Gyldig e-postadresse er påkrevd' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('newsletter');
    const subscribersCollection = db.collection('subscribers');

    // Check if already subscribed
    const existingSubscriber = await subscribersCollection.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.isVerified) {
        return NextResponse.json(
          { message: 'Du er allerede abonnent på vårt nyhetsbrev' },
          { status: 400 }
        );
      } else {
        // Resend verification email
        try {
          await EmailService.sendNewsletterVerificationEmail({ email });
          return NextResponse.json(
            { message: 'Bekreftelse e-post sendt på nytt. Sjekk innboksen din.' },
            { status: 200 }
          );
        } catch (emailError) {
          return NextResponse.json(
            { message: 'Kunne ikke sende bekreftelse e-post' },
            { status: 500 }
          );
        }
      }
    }

    // Create new subscriber
    const unsubscribeToken = uuidv4();
    const newSubscriber = {
      email,
      isVerified: false,
      subscribedAt: new Date(),
      unsubscribeToken
    };

    await subscribersCollection.insertOne(newSubscriber);

    // Send verification email
    try {
      await EmailService.sendNewsletterVerificationEmail({ email });
      
      return NextResponse.json(
        { message: 'Takk for påmeldingen! Sjekk e-posten din for å bekrefte abonnementet.' },
        { status: 201 }
      );
    } catch (emailError) {
      console.error('Failed to send newsletter verification:', emailError);
      return NextResponse.json(
        { message: 'Påmelding registrert, men kunne ikke sende bekreftelse e-post' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
```

Opprett `src/app/api/newsletter/verify/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import clientPromise from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token er påkrevd' },
        { status: 400 }
      );
    }

    const verification = await EmailService.verifyToken(token, 'newsletter_verification');

    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { message: 'Ugyldig eller utløpt token' },
        { status: 400 }
      );
    }

    // Update newsletter subscriber as verified
    const client = await clientPromise;
    const db = client.db('newsletter');
    
    const result = await db.collection('subscribers').updateOne(
      { email: verification.email },
      { 
        $set: { 
          isVerified: true, 
          verifiedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Abonnent ikke funnet' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Nyhetsbrev-abonnement bekreftet! Du vil nå motta våre oppdateringer.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter verification error:', error);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
```

## 8. Frontend Pages

### Email Verification Page

Opprett `src/app/verify-email/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ugyldig verifikasjonslenke');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Noe gikk galt. Prøv igjen senere.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Bekrefter e-post...</h1>
            <p className="text-gray-600">Vennligst vent</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">E-post bekreftet!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Du blir omdirigert til innloggingssiden...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verifisering mislyktes</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Tilbake til registrering
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Newsletter Verification Page

Opprett `src/app/verify-newsletter/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyNewsletterPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ugyldig verifikasjonslenke');
      return;
    }

    const verifyNewsletter = async () => {
      try {
        const response = await fetch('/api/newsletter/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Noe gikk galt. Prøv igjen senere.');
      }
    };

    verifyNewsletter();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Bekrefter abonnement...</h1>
            <p className="text-gray-600">Vennligst vent</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Abonnement bekreftet!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Tilbake til forsiden
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Bekreftelse mislyktes</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Tilbake til forsiden
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

## 9. Oppdater Login Logic

Modifiser `src/lib/authOptions.ts` for å sjekke email-verifisering:

```typescript
// Legg til i authorize function:
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Email og passord er påkrevd');
  }

  const client = await clientPromise;
  const db = client.db('fargeleggingsapp');
  const user = await db.collection('users').findOne({ email: credentials.email });

  if (!user || !user.password) {
    return null;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new Error('E-post ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.');
  }

  const isPasswordValid = await compare(credentials.password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role || 'user'
  };
}
```

## 10. Oppdater Newsletter Components

Modifiser eksisterende nyhetsbrev-skjema i `src/components/shared/Footer.tsx`:

```typescript
const [email, setEmail] = useState('');
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [message, setMessage] = useState('');

const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('loading');
  
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setStatus('success');
      setMessage(data.message);
      setEmail(''); // Clear form
    } else {
      setStatus('error');
      setMessage(data.message);
    }
  } catch (error) {
    setStatus('error');
    setMessage('Noe gikk galt. Prøv igjen senere.');
  }
};
```

## 11. Database Indexes

Legg til nødvendige MongoDB-indexes i `scripts/create-indexes.js`:

```javascript
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI er ikke definert i miljøvariablene');
    process.exit(1);
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true
  };

  const client = new MongoClient(uri, options);

  try {
    console.log('Kobler til MongoDB...');
    await client.connect();
    console.log('Koblet til MongoDB');

    // Users collection indexes
    const usersDb = client.db('fargeleggingsapp');
    await usersDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await usersDb.collection('users').createIndex({ emailVerified: 1 });
    await usersDb.collection('users').createIndex({ createdAt: -1 });
    console.log('Opprettet indekser for users-collection');

    // Verification tokens indexes
    await usersDb.collection('verification_tokens').createIndex({ token: 1 }, { unique: true });
    await usersDb.collection('verification_tokens').createIndex({ email: 1 });
    await usersDb.collection('verification_tokens').createIndex({ type: 1 });
    await usersDb.collection('verification_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await usersDb.collection('verification_tokens').createIndex({ createdAt: -1 });
    console.log('Opprettet indekser for verification_tokens-collection');

    // Newsletter subscribers indexes
    const newsletterDb = client.db('newsletter');
    await newsletterDb.collection('subscribers').createIndex({ email: 1 }, { unique: true });
    await newsletterDb.collection('subscribers').createIndex({ isVerified: 1 });
    await newsletterDb.collection('subscribers').createIndex({ subscribedAt: -1 });
    await newsletterDb.collection('subscribers').createIndex({ unsubscribeToken: 1 }, { unique: true });
    console.log('Opprettet indekser for newsletter subscribers-collection');

    console.log('Alle indekser opprettet');
  } catch (error) {
    console.error('Feil ved oppretting av indekser:', error);
  } finally {
    await client.close();
    console.log('Databasetilkobling lukket');
  }
}

createIndexes().catch(error => {
  console.error('Uventet feil:', error);
});
```

## 12. Resend Setup

### Opprett Resend-konto
1. Gå til [resend.com](https://resend.com)
2. Registrer konto eller logg inn
3. Verifiser domenet ditt (eller bruk Resend sitt testdomene for utvikling)
4. Opprett API-nøkkel under "API Keys"
5. Legg til API-nøkkelen i `.env.local`

### Domene-verifisering (produksjon)
```bash
# For produksjon, legg til disse DNS-records:
# Type: TXT
# Name: _resend
# Value: [din resend verifikasjonskode]
```

## 13. Testing Guide

### 1. Test Brukerregistrering med Email-verifisering

```bash
# Registrer ny bruker
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Bruker",
    "email": "test@example.com",
    "password": "testpassord123"
  }'

# Forventet svar:
# {
#   "message": "Bruker registrert. Sjekk e-posten din for bekreftelseslenke.",
#   "requiresVerification": true
# }
```

### 2. Test Newsletter-påmelding

```bash
# Meld på nyhetsbrev
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsletter@example.com"
  }'

# Forventet svar:
# {
#   "message": "Takk for påmeldingen! Sjekk e-posten din for å bekrefte abonnementet."
# }
```

### 3. Test Database-tilstand

```javascript
// Sjekk bruker-status i MongoDB
db.users.findOne({ email: "test@example.com" })
// Skal vise emailVerified: false

// Sjekk nyhetsbrev-abonnent
db.subscribers.findOne({ email: "newsletter@example.com" })
// Skal vise isVerified: false

// Sjekk verification tokens
db.verification_tokens.find({ email: "test@example.com" })
// Skal vise aktive tokens
```

## 14. Sikkerhetstiltak

### Token-sikkerhet
- Tokens utløper automatisk (TTL indexes)
- UUID v4 for uforutsigbare tokens
- Tokens kan kun brukes én gang
- Separate token-typer for ulike formål

### Rate Limiting (anbefalt tillegg)
Opprett `src/lib/rate-limiter.ts`:

```typescript
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

// Bruk i API-routes:
export function getRealIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}
```

## 15. Produksjonsconfiguration

### Environment Variables for Production
```bash
# Produksjon .env
RESEND_API_KEY=re_prod_your_actual_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME="Fargelegg Nå"
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS=24
NEWSLETTER_VERIFICATION_TOKEN_EXPIRES_HOURS=72
```

### Next.js Build og Deploy
```bash
# Test lokalt
npm run build
npm run start

# Deploy til Vercel/Netlify/egen server
# Husk å sette environment variables i deployment-panelet
```

## 16. Monitoring og Logging

### Email Delivery Tracking
Legg til i `src/lib/email-service.ts`:

```typescript
// Legg til logging for email-sending
static async logEmailActivity(email: string, type: string, status: 'sent' | 'failed', messageId?: string) {
  try {
    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    await db.collection('email_logs').insertOne({
      email,
      type,
      status,
      messageId,
      timestamp: new Date(),
      userAgent: '', // kan hentes fra request headers
      ip: '' // kan hentes fra request
    });
  } catch (error) {
    console.error('Failed to log email activity:', error);
  }
}
```

### Dashboard for Admin (anbefalt utvidelse)
```typescript
// src/app/admin/email-verification/page.tsx
// Vise statistikk over:
// - Antall uverifiserte brukere
// - Email delivery rate
// - Nyhetsbrev abonnenter status
// - Failed verification attempts
```

## 17. Feilsøking

### Vanlige problemer og løsninger

**1. Email kommer ikke frem**
- Sjekk Resend dashboard for delivery status
- Kontroller SPAM-mappen
- Verifiser domene i Resend
- Sjekk rate limits

**2. Token utløper for raskt**
- Øk `EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS`
- Sjekk TTL index-konfigurasjon
- Verifiser timezone-settings

**3. Database connection issues**
- Sjekk MongoDB connection string
- Verifiser database og collection names
- Kontroller network connectivity

**4. Frontend validation errors**
```typescript
// Legg til bedre error handling i forms
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 18. Utvidelsesmuligheter

### Future Enhancements
1. **SMS-verifisering** som backup
2. **Social login** med automatisk verifisering
3. **Batch email sending** for nyhetsbrev
4. **Email templates** med rich content
5. **Unsubscribe functionality** for nyhetsbrev
6. **Re-send verification** functionality
7. **Admin dashboard** for user management

### Performance Optimizations
- Redis cache for rate limiting
- Bull Queue for email sending
- CDN for email assets
- Database query optimization

## 19. Testing Checklist

- [ ] Brukerregistrering sender email
- [ ] Email-verifisering fungerer
- [ ] Login blokkerer uverifiserte brukere
- [ ] Newsletter påmelding sender email
- [ ] Newsletter verifisering fungerer
- [ ] Tokens utløper korrekt
- [ ] Database indexes er opprettet
- [ ] Rate limiting fungerer
- [ ] Error handling er robust
- [ ] Email templates ser bra ut
- [ ] Mobile-responsivt design
- [ ] Cross-browser kompatibilitet

## 20. Deployment Sjekkliste

- [ ] Environment variables satt i produksjon
- [ ] Resend domene verifisert
- [ ] MongoDB produksjonsdatabase konfigurert
- [ ] SSL-sertifikat installert
- [ ] DNS records oppdatert
- [ ] Backup rutiner på plass
- [ ] Monitoring og logging aktivert
- [ ] Performance testing gjennomført

---

## Sammendrag

Denne implementeringen gir deg:

✅ **Sikker email-verifisering** for både brukere og nyhetsbrev  
✅ **Robust token-system** med automatisk utløp  
✅ **Profesjonelle email-templates** med Resend  
✅ **Database-optimaliseringer** med riktige indexes  
✅ **Error handling** og rate limiting  
✅ **Mobile-vennlige** verifikasjonssider  
✅ **Production-ready** konfiguration  

Start med å sette opp Resend-kontoen og environment variables, deretter implementer steg for steg. Test grundig i development før deploy til produksjon.