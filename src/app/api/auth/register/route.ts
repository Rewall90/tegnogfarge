import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

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

    // Koble til databasen
    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    const usersCollection = db.collection('users');

    // Sjekk om e-posten allerede er registrert
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'E-postadressen er allerede i bruk' },
        { status: 400 }
      );
    }

    // Hash passordet
    const hashedPassword = await hash(password, 12);

    // Opprett bruker
    const newUser = {
      _id: new ObjectId(),
      name,
      email,
      password: hashedPassword,
      role: 'user' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      favoriteIds: []
    };

    // Lagre i databasen
    await usersCollection.insertOne(newUser);

    // Returner suksess, men ikke passordet
    const { password: _pwd, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { 
        message: 'Bruker registrert', 
        user: userWithoutPassword 
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