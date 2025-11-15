import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { validateTurnstileToken, validateHoneypot } from '@/lib/turnstile';

const resend = new Resend(process.env.RESEND_API_KEY);
// --- DEBUGGING STEP ---
// Temporarily change this to a reliable personal email (like Gmail/Outlook)
// to test if the notification is being sent correctly.
const adminEmail = "petter@tegnogfarge.no"; // <-- CHANGE THIS
// const adminEmail = 'petter@tegnogfarge.no';

const contactFormSchema = z.object({
  name: z.string().min(1, { message: 'Navn er påkrevd' }),
  email: z.string().email({ message: 'Ugyldig e-postadresse' }),
  message: z.string().min(1, { message: 'Melding kan ikke være tom' }),
  'cf-turnstile-response': z.string().min(1, { message: 'CAPTCHA-verifisering er påkrevd' }),
  honeypot: z.string().optional(),
  formLoadTime: z.number({ required_error: 'Ugyldig skjemadata' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
      return NextResponse.json({ error: `Invalid input: ${errorMessages}` }, { status: 400 });
    }

    const { name, email, message, 'cf-turnstile-response': turnstileToken, honeypot, formLoadTime } = parsed.data;

    // --- TIME-BASED VALIDATION ---
    // Check submission timing - bots often submit instantly, humans take at least 3 seconds
    const currentTime = Date.now();
    const timeDiff = (currentTime - formLoadTime) / 1000; // Convert to seconds

    if (timeDiff < 3) {
      console.warn(`Form submitted too quickly: ${timeDiff.toFixed(2)}s - potential bot detected`);
      return NextResponse.json(
        { error: 'Vennligst vent litt før du sender skjemaet' },
        { status: 400 }
      );
    }

    if (timeDiff > 1800) { // 30 minutes
      console.warn(`Form submission timeout: ${timeDiff.toFixed(2)}s`);
      return NextResponse.json(
        { error: 'Skjemaet har utløpt. Vennligst last inn siden på nytt.' },
        { status: 400 }
      );
    }

    // --- HONEYPOT VALIDATION ---
    // Check honeypot field - if filled, it's likely a bot
    if (!validateHoneypot(honeypot)) {
      console.warn('Honeypot validation failed - potential bot detected');
      return NextResponse.json({ error: 'Validering mislyktes' }, { status: 400 });
    }

    // --- TURNSTILE VALIDATION ---
    // Get client IP for additional verification
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     undefined;

    const turnstileResult = await validateTurnstileToken(turnstileToken, clientIp);

    if (!turnstileResult.success) {
      console.warn('Turnstile validation failed:', turnstileResult.message);
      return NextResponse.json(
        { error: 'CAPTCHA-verifisering mislyktes. Vennligst prøv igjen.' },
        { status: 400 }
      );
    }

    // Create email promises
    const sendAdminEmail = resend.emails.send({
      from: 'Kontaktskjema <noreply@tegnogfarge.no>',
      to: adminEmail,
      subject: `Ny henvendelse fra kontaktskjema: ${name}`,
      reply_to: email,
      html: `
        <h1>Ny henvendelse fra kontaktskjema på TegnOgFarge.no</h1>
        <p><strong>Navn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <hr>
        <p><strong>Melding:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    const sendUserConfirmationEmail = resend.emails.send({
        from: 'TegnOgFarge.no <noreply@tegnogfarge.no>',
        to: email,
        subject: 'Vi har mottatt din henvendelse!',
        html: `
            <h1>Takk, ${name}!</h1>
            <p>Vi har mottatt henvendelsen din og vil svare deg så snart som mulig.</p>
            <p>Her er en kopi av meldingen du sendte:</p>
            <blockquote style="border-left: 2px solid #cccccc; padding-left: 1rem; margin-left: 1rem; color: #666666;">
                <p style="white-space: pre-wrap;">${message}</p>
            </blockquote>
            <p>Med vennlig hilsen,<br>Teamet hos TegnOgFarge.no</p>
        `,
    });

    // Await both promises concurrently
    await Promise.all([sendAdminEmail, sendUserConfirmationEmail]);

    return NextResponse.json({ message: 'Meldingen ble sendt!' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json({ error: 'Kunne ikke sende meldingen. Prøv igjen senere.' }, { status: 500 });
  }
} 