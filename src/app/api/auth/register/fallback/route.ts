import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Dette er en fallback-rute for registrering som ikke krever MongoDB
// Brukes kun for testing når MongoDB ikke er tilgjengelig
export async function POST(request: Request) {
  try {
    console.log('=======================================');
    console.log('FALLBACK REGISTRERING BRUKT - INGEN DATABASE TILKOBLING');
    console.log('=======================================');
    console.log('Dette betyr at brukeren IKKE blir lagret i MongoDB!');
    console.log('Tidspunkt:', new Date().toISOString());
    
    // Parse input
    const body = await request.json();
    const { name, email, password } = body;
    
    // Grunnleggende validering
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

    // Simuler en bruker (uten å lagre i database)
    const mockUser = {
      id: uuidv4(),
      name,
      email,
      role: 'user',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteIds: []
    };
    
    // Generer en falsk verifiseringslink
    const mockVerificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${uuidv4()}`;
    
    console.log('FALLBACK: Simulert bruker:', { ...mockUser, password: '[SKJULT]' });
    console.log('FALLBACK: Simulert verifiseringslenke:', mockVerificationUrl);
    console.log('=======================================');
    
    // Returner responsen
    return NextResponse.json({
      message: '[FALLBACK MODUS] Bruker simulert registrert. Ingen database brukt.',
      user: mockUser,
      requiresVerification: true,
      verificationUrl: mockVerificationUrl,
      warning: 'FALLBACK-MODUS: Denne brukeren er IKKE lagret i databasen! Dette er kun en test.'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Feil i fallback registrering:', error);
    return NextResponse.json(
      { message: 'Intern serverfeil i fallback-rute', error: error.message },
      { status: 500 }
    );
  }
} 