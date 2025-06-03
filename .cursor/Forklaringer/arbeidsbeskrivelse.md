# Implementasjonsguide: Brukerautentisering for Fargeleggingssiden

## Oversikt

Denne guiden beskriver implementering av brukerautentisering for fargeleggingssiden. Løsningen bygger på eksisterende infrastruktur med NextAuth.js, MongoDB og React Context API.

## Arkitektur

### Eksisterende komponenter som skal gjenbrukes:
- **NextAuth.js** - Allerede delvis konfigurert i `/src/lib/authOptions.ts`
- **MongoDB** - Database-tilkobling eksisterer i `/src/lib/db.ts`
- **AuthContext** - React Context for autentisering i `/contexts/AuthContext.tsx`
- **Brukermodeller** - Definert i `/models/user.ts`
- **Middleware** - Grunnleggende middleware i `/middleware.ts`

### Nye komponenter som må implementeres:
1. Login-side (`/src/app/login/page.tsx`)
2. Registreringsside (`/src/app/register/page.tsx`)
3. Auth-guards for beskyttede ruter
4. UI-komponenter for login/registrering

## Steg-for-steg implementering

### Steg 1: Konfigurer database-tilkobling

Opprett filen `/src/lib/db.ts` hvis den ikke eksisterer:

```typescript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // I utvikling, bruk en global variabel for å bevare tilkoblingen
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // I produksjon, opprett ny tilkobling
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

### Steg 2: Oppdater NextAuth-konfigurasjonen

Fullfør implementeringen i `/src/lib/authOptions.ts`:

```typescript
// Fjern kommentarer fra de kommenterte linjene
// Legg til bcrypt for passordhashing
const user = await db.collection('users').findOne({ email: credentials.email });

if (!user || !user.password) {
  return null;
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
```

### Steg 3: Lag login-siden

Opprett `/src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Feil e-post eller passord');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('En feil oppstod. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Logg inn</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <Input
            type="password"
            label="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logger inn...' : 'Logg inn'}
          </Button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Har du ikke konto?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Registrer deg her
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Steg 4: Lag registreringssiden

Opprett `/src/app/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Valider passord
    if (formData.password !== formData.confirmPassword) {
      setError('Passordene matcher ikke');
      return;
    }

    if (formData.password.length < 8) {
      setError('Passordet må være minst 8 tegn');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrering feilet');
      } else {
        // Auto-login etter registrering
        router.push('/login?registered=true');
      }
    } catch (error) {
      setError('En feil oppstod. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Opprett konto</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Navn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
          
          <Input
            type="email"
            label="E-post"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
          
          <Input
            type="password"
            label="Passord"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
            helperText="Minst 8 tegn"
          />
          
          <Input
            type="password"
            label="Bekreft passord"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
          />
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Oppretter konto...' : 'Opprett konto'}
          </Button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Har du allerede konto?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Logg inn her
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Steg 5: Implementer AuthGuard-komponent

Opprett `/src/components/auth/AuthGuard.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Steg 6: Beskytt nedlasting og fargelegging

#### Oppdater DownloadPdfButton (`/src/components/buttons/DownloadPdfButton.tsx`):

```typescript
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

interface DownloadPdfButtonProps {
  downloadUrl: string;
  title?: string;
  className?: string;
}

export function DownloadPdfButton({ downloadUrl, title = 'Last ned PDF', className }: DownloadPdfButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  };

  return (
    <Button
      href={session ? downloadUrl : '#'}
      variant="primary"
      className={className}
      ariaLabel={title}
      external={false}
      onClick={handleClick}
    >
      {title}
    </Button>
  );
}
```

#### Oppdater StartColoringButton (`/src/components/buttons/StartColoringButton.tsx`):

```typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface StartColoringButtonProps {
  drawingId: string;
  title?: string;
  className?: string;
}

export function StartColoringButton({ drawingId, title = 'Online Coloring', className }: StartColoringButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  function handleClick() {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('coloringAppImageId', drawingId);
      router.push('/coloring-app');
    }
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={title}
      onClick={handleClick}
    >
      {title}
    </button>
  );
}
```

### Steg 7: Oppdater Header med brukerinfo

Oppdater `/src/components/shared/Header.tsx` for å vise innlogget bruker:

```typescript
// Legg til import
import { useSession, signOut } from 'next-auth/react';

// I komponenten, legg til:
const { data: session } = useSession();

// Erstatt login-knappen med:
<div className="hidden md:flex items-center space-x-4">
  {session ? (
    <>
      <span className="text-gray-600">Hei, {session.user.name}</span>
      <button
        onClick={() => signOut()}
        className="text-gray-600 hover:text-gray-900"
      >
        Logg ut
      </button>
    </>
  ) : (
    <Link href="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
      Logg inn
    </Link>
  )}
</div>
```

### Steg 8: Wrap app med SessionProvider

Oppdater `/src/app/layout.tsx`:

```typescript
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Steg 9: Miljøvariabler

Legg til følgende i `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/fargelegging

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=din-hemmelige-nøkkel-her

# Sanity (eksisterende)
NEXT_PUBLIC_SANITY_PROJECT_ID=fn0kjvlp
NEXT_PUBLIC_SANITY_DATASET=production
```

### Steg 10: Database-oppsett

Opprett indexes i MongoDB for bedre ytelse:

```javascript
// Kjør dette i MongoDB shell eller Compass
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
```

## Brukerflyt

### Registrering:
1. Bruker går til `/register`
2. Fyller ut skjema med navn, e-post og passord
3. Systemet validerer og hasher passordet
4. Bruker opprettes i MongoDB
5. Bruker sendes til login-siden

### Innlogging:
1. Bruker går til `/login`
2. Fyller inn e-post og passord
3. NextAuth validerer credentials
4. Session opprettes
5. Bruker sendes til dashboard eller forrige side

### Beskyttet tilgang:
1. Ikke-innlogget bruker prøver å laste ned eller fargelegge
2. Systemet sjekker session
3. Bruker sendes til login med redirect-parameter
4. Etter innlogging sendes bruker tilbake til ønsket side

## Testing

### Test registrering:
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test innlogging:
1. Gå til `/login`
2. Bruk test-credentials
3. Verifiser at session opprettes
4. Sjekk at bruker kan laste ned og fargelegge

## Sikkerhetshensyn

1. **Passordhashing**: Alle passord hashes med bcrypt
2. **Session-sikkerhet**: NextAuth håndterer secure cookies
3. **CSRF-beskyttelse**: Innebygd i NextAuth
4. **Rate limiting**: Bør implementeres på API-endepunkter
5. **Input-validering**: Validering på både client og server

## Fremtidige forbedringer

1. **E-postverifisering**: Send velkomst-e-post med Resend
2. **Glemt passord**: Implementer reset-funksjonalitet
3. **Sosial innlogging**: Legg til Google/Facebook OAuth
4. **Brukerprofilside**: La brukere oppdatere info
5. **Favoritter**: Lagre brukerens favoritt-tegninger

## Feilsøking

### Vanlige problemer:

1. **"Cannot connect to MongoDB"**
   - Sjekk at MongoDB kjører
   - Verifiser connection string

2. **"Invalid credentials"**
   - Sjekk at e-post eksisterer
   - Verifiser passord-hashing

3. **Session ikke opprettet**
   - Sjekk NEXTAUTH_SECRET
   - Verifiser cookie-settings

4. **Redirect fungerer ikke**
   - Sjekk at redirect-parameter preserveres
   - Verifiser at SessionProvider wrapper hele appen