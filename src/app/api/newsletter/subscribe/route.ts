import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { EmailService } from '@/lib/email-service';
import { v4 as uuidv4 } from 'uuid';
import { validateTurnstileToken, validateHoneypot } from '@/lib/turnstile';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Ugyldig e-postadresse' }),
  'cf-turnstile-response': z.string().min(1, { message: 'CAPTCHA-verifisering er påkrevd' }),
  honeypot: z.string().optional(),
  formLoadTime: z.number({ required_error: 'Ugyldig skjemadata' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
      return NextResponse.json(
        { message: `Ugyldig input: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { email, 'cf-turnstile-response': turnstileToken, honeypot, formLoadTime } = parsed.data;

    // --- TIME-BASED VALIDATION ---
    const currentTime = Date.now();
    const timeDiff = (currentTime - formLoadTime) / 1000;

    if (timeDiff < 3) {
      console.warn(`Newsletter form submitted too quickly: ${timeDiff.toFixed(2)}s - potential bot`);
      return NextResponse.json(
        { message: 'Vennligst vent litt før du sender skjemaet' },
        { status: 400 }
      );
    }

    if (timeDiff > 1800) {
      console.warn(`Newsletter form submission timeout: ${timeDiff.toFixed(2)}s`);
      return NextResponse.json(
        { message: 'Skjemaet har utløpt. Vennligst last inn siden på nytt.' },
        { status: 400 }
      );
    }

    // --- HONEYPOT VALIDATION ---
    if (!validateHoneypot(honeypot)) {
      console.warn('Newsletter honeypot validation failed - potential bot detected');
      return NextResponse.json({ message: 'Validering mislyktes' }, { status: 400 });
    }

    // --- TURNSTILE VALIDATION ---
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     undefined;

    const turnstileResult = await validateTurnstileToken(turnstileToken, clientIp);

    if (!turnstileResult.success) {
      console.warn('Newsletter Turnstile validation failed:', turnstileResult.message);
      return NextResponse.json(
        { message: 'CAPTCHA-verifisering mislyktes. Vennligst prøv igjen.' },
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