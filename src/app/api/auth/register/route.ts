import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import clientPromise from '../../../../../lib/db';
import { toSafeUser } from '../../../../../models/user';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate the data
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Navn, e-post og passord er påkrevd' },
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
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'E-postadressen er allerede i bruk' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get the newly created user
    const newUser = await db.collection('users').findOne({ _id: result.insertedId });

    // Return the safe user (without password)
    return NextResponse.json(
      { user: toSafeUser(newUser) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'En feil oppstod under registrering' },
      { status: 500 }
    );
  }
} 