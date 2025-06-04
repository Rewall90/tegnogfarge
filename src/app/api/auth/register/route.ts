import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email-service';

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
    console.log('Behandler registreringsforespørsel...');
    
    // Parse JSON-input
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Feil ved parsing av JSON:', jsonError);
      return NextResponse.json(
        { message: 'Ugyldig JSON-data i forespørselen' },
        { status: 400 }
      );
    }
    
    const { name, email, password } = body;
    console.log('Registrering for:', email, '(passord ikke logget)');

    // Valider input
    if (!name || !email || !password) {
      console.log('Manglende påkrevde felt for registrering');
      return NextResponse.json(
        { message: 'Manglende påkrevde felt' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      console.log('Passordet er for kort');
      return NextResponse.json(
        { message: 'Passordet må være minst 8 tegn' },
        { status: 400 }
      );
    }

    // Koble til databasen med timeout
    console.log('Forsøker å koble til MongoDB...');
    let client;
    try {
      // Bruk fallback hvis tilkoblingen tar for lang tid
      client = await withTimeout(clientPromise, 10000);
      console.log('MongoDB-tilkobling vellykket');
    } catch (error: unknown) {
      const dbError = error as Error;
      console.error('Feil ved tilkobling til MongoDB:', dbError);
      
      // Prøv fallback-registrering
      console.log('Prøver fallback-registrering...');
      try {
        const fallbackResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/register/fallback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback-registrering vellykket');
          return NextResponse.json(fallbackData, { status: 201 });
        }
      } catch (fallbackError) {
        console.error('Fallback-registrering feilet også:', fallbackError);
      }
      
      return NextResponse.json(
        { 
          message: 'Databasetilkoblingsfeil, prøv igjen senere', 
          error: dbError.message,
          tip: 'Serveren har for øyeblikket problemer med å koble til databasen. Dette kan skyldes høy belastning eller nettverksproblemer.'
        },
        { status: 503 }  // Service Unavailable
      );
    }

    const db = client.db('fargeleggingsapp');
    const usersCollection = db.collection('users');

    // Sjekk om e-posten allerede er registrert
    console.log('Sjekker om e-post allerede eksisterer:', email);
    let existingUser;
    try {
      existingUser = await withTimeout(usersCollection.findOne({ email }), 5000);
    } catch (error: unknown) {
      const findError = error as Error;
      console.error('Feil ved søking etter eksisterende bruker:', findError);
      return NextResponse.json(
        { 
          message: 'Databaseoperasjonen tok for lang tid', 
          error: findError.message,
          tip: 'Serveren er opptatt. Vennligst prøv igjen om litt.'
        },
        { status: 503 }
      );
    }

    if (existingUser) {
      console.log('E-post allerede i bruk:', email);
      return NextResponse.json(
        { message: 'E-postadressen er allerede i bruk' },
        { status: 400 }
      );
    }

    // Hash passordet
    console.log('Hasher passord...');
    let hashedPassword;
    try {
      hashedPassword = await hash(password, 12);
    } catch (error: unknown) {
      const hashError = error as Error;
      console.error('Feil ved hashing av passord:', hashError);
      return NextResponse.json(
        { message: 'Feil ved behandling av passord', error: hashError.message },
        { status: 500 }
      );
    }

    // Opprett bruker med emailVerified: false
    const newUser = {
      _id: new ObjectId(),
      name,
      email,
      password: hashedPassword,
      role: 'user' as const,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteIds: []
    };

    // Lagre i databasen
    console.log('Forsøker å lagre ny bruker...');
    try {
      await withTimeout(usersCollection.insertOne(newUser), 5000);
      console.log('Bruker lagret i databasen:', email);
    } catch (error: unknown) {
      const insertError = error as Error;
      console.error('Feil ved lagring av bruker:', insertError);
      return NextResponse.json(
        { 
          message: 'Kunne ikke lagre bruker i databasen', 
          error: insertError.message,
          tip: 'Serveren er opptatt. Vennligst prøv igjen om litt.'
        },
        { status: 503 }
      );
    }

    // Send verification email
    let verificationResult;
    try {
      console.log('Sender verifiseringsmail til:', email);
      verificationResult = await EmailService.sendUserVerificationEmail({ email, userName: name });
      console.log("Verification result:", verificationResult);
    } catch (emailError) {
      console.error('Feil ved sending av verifiseringsmail:', emailError);
      // Don't fail registration if email fails
    }

    // Returner suksess, men ikke passordet
    const { password: _pwd, ...userWithoutPassword } = newUser;
    
    // Prepare response data
    const responseData: any = { 
      message: 'Bruker registrert. Sjekk e-posten din for bekreftelseslenke.', 
      user: userWithoutPassword,
      requiresVerification: true
    };

    // In development mode, include the verification URL for easier testing
    if (process.env.NODE_ENV === 'development' && verificationResult?.verificationUrl) {
      responseData.verificationUrl = verificationResult.verificationUrl;
      console.log('Utviklingsmodus: Verifiseringslink for testing:', verificationResult.verificationUrl);
    }
    
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Registreringsfeil:', error);
    return NextResponse.json(
      { 
        message: 'Intern serverfeil', 
        error: error.message, 
        stack: error.stack,
        tip: 'Det oppstod en uventet feil. Vennligst prøv igjen senere eller kontakt support.'
      },
      { status: 500 }
    );
  }
} 