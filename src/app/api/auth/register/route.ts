import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email-service';
import { validateTurnstileToken } from '@/lib/turnstile';

// Hjelpefunksjon for å sette timeout på databaseoperasjoner
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

export async function POST(request: Request) {
  try {
    // Parse JSON-input
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: 'Ugyldig JSON-data i forespørselen' },
        { status: 400 }
      );
    }
    
    const { name, email, password, turnstileToken } = body;

    // Valider input
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

    // Valider Turnstile CAPTCHA token
    if (!turnstileToken) {
      return NextResponse.json(
        { message: 'CAPTCHA-verifisering mangler' },
        { status: 400 }
      );
    }

    const turnstileValidation = await validateTurnstileToken(turnstileToken);
    if (!turnstileValidation.success) {
      console.warn('Turnstile validation failed for registration:', email, turnstileValidation.errorCodes);
      return NextResponse.json(
        { message: 'CAPTCHA-verifisering feilet. Prøv igjen.' },
        { status: 400 }
      );
    }

    // Koble til databasen med timeout
    let client;
    try {
      client = await withTimeout(clientPromise, 10000);
    } catch (dbError: any) {
      // Fallback-plan: Hvis vi ikke kan koble til databasen, bruk fallback-endpoint
      try {
        const fallbackResponse = await fetch(new URL('/api/auth/register/fallback', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        
        return fallbackResponse;
      } catch (fallbackError) {
        return NextResponse.json(
          { message: 'Kunne ikke utføre registrering. Prøv igjen senere.' },
          { status: 503 }
        );
      }
    }
    
    const db = client.db('fargeleggingsapp');
    const users = db.collection('users');
    
    // Sjekk om e-posten allerede er i bruk
    const existingUser = await users.findOne({ email });
    
    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { message: 'E-postadressen er allerede i bruk' },
          { status: 409 }
        );
      } else {
        // Bruker eksisterer men er ikke verifisert - tillat ny registrering
        // Dette kan skje hvis brukeren ikke fullførte verifiseringen
        await users.deleteOne({ _id: existingUser._id });
      }
    }
    
    // Hash passordet
    const hashedPassword = await hash(password, 10);
    
    // Opprett en ny bruker med initial verifikasjonsstatus
    const newUserId = new ObjectId();
    const newUser = {
      _id: newUserId,
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationRequested: new Date(),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Lagre brukeren i databasen
    const insertResult = await users.insertOne(newUser);
    
    // Verifiser at brukeren ble lagret
    const savedUser = await users.findOne({ _id: newUserId });
    
    if (!savedUser) {
      return NextResponse.json(
        { message: 'Det oppstod en feil ved lagring av brukeren' },
        { status: 500 }
      );
    }
    
    // Send bekreftelsesmail
    const verificationResult = await EmailService.sendUserVerificationEmail({
      email,
      userName: name
    });
    
    // Sett opp responsen
    const responseData: any = {
      userId: newUser._id.toString(),
      message: 'Bruker registrert. Sjekk e-posten din for bekreftelseslenke.'
    };
    
    // In development mode, include the verification URL for easier testing
    if (process.env.NODE_ENV === 'development' && verificationResult?.verificationUrl) {
      responseData.verificationUrl = verificationResult.verificationUrl;
    }
    
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Registreringsfeil:', error);
    return NextResponse.json(
      { 
        message: 'Intern serverfeil', 
        error: error.message
      },
      { status: 500 }
    );
  }
} 