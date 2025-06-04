import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verifyToken } from '@/lib/tokens';
import { findUserByEmail, findAndUpdateUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { message: 'Ingen verifiseringskode mottatt' },
        { status: 400 }
      );
    }
    
    // Sanitize token - in case it's a 6-digit code with spaces
    const cleanToken = token.trim();
    
    // Verify the token
    const verification = await verifyToken(cleanToken);
    
    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { message: 'Ugyldig eller utløpt verifiseringskode' },
        { status: 400 }
      );
    }
    
    // Find the user with this email
    const user = await findUserByEmail(verification.email);
    
    if (!user) {
      // Attempt to get a list of users for debugging
      const client = await clientPromise;
      const db = client.db('fargeleggingsapp');
      const allUsers = await db.collection('users').find({}).toArray();
      
      return NextResponse.json(
        { message: 'Brukeren ble ikke funnet' },
        { status: 404 }
      );
    }
    
    // Update user to mark email as verified
    const updateData = {
      $set: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    };
    
    const updatedUser = await findAndUpdateUser(verification.email, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Kunne ikke oppdatere bruker' },
        { status: 500 }
      );
    }
    
    // Return success with user data that will be used for auto-login
    return NextResponse.json({
      success: true,
      message: 'E-postadressen er bekreftet',
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        id: updatedUser._id.toString()
      }
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { message: 'Intern serverfeil ved e-postverifisering' },
      { status: 500 }
    );
  }
} 