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
        } catch (emailError: unknown) {
          const typedError = emailError as Error;
          console.error('Failed to resend verification email:', typedError);
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
    } catch (emailError: unknown) {
      const typedError = emailError as Error;
      console.error('Failed to send newsletter verification:', typedError);
      return NextResponse.json(
        { message: 'Påmelding registrert, men kunne ikke sende bekreftelse e-post' },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Newsletter subscription error:', typedError);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
} 