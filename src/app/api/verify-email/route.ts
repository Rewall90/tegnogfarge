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