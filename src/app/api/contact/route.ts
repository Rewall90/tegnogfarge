import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { validateTurnstileToken, validateHoneypot } from '@/lib/turnstile';
import { getContactEmailTemplates } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
// --- DEBUGGING STEP ---
// Temporarily change this to a reliable personal email (like Gmail/Outlook)
// to test if the notification is being sent correctly.
const adminEmail = "petter@tegnogfarge.no"; // <-- CHANGE THIS
// const adminEmail = 'petter@tegnogfarge.no';

// Locale-aware error messages
function getErrorMessages(locale: string) {
  const messages = {
    no: {
      nameRequired: 'Navn er påkrevd',
      invalidEmail: 'Ugyldig e-postadresse',
      messageRequired: 'Melding kan ikke være tom',
      captchaRequired: 'CAPTCHA-verifisering er påkrevd',
      invalidFormData: 'Ugyldig skjemadata',
      submittedTooQuickly: 'Vennligst vent litt før du sender skjemaet',
      formExpired: 'Skjemaet har utløpt. Vennligst last inn siden på nytt.',
      validationFailed: 'Validering mislyktes',
      captchaFailed: 'CAPTCHA-verifisering mislyktes. Vennligst prøv igjen.',
      messageSent: 'Meldingen ble sendt!',
      sendFailed: 'Kunne ikke sende meldingen. Prøv igjen senere.',
    },
    sv: {
      nameRequired: 'Namn krävs',
      invalidEmail: 'Ogiltig e-postadress',
      messageRequired: 'Meddelandet kan inte vara tomt',
      captchaRequired: 'CAPTCHA-verifiering krävs',
      invalidFormData: 'Ogiltig formulärdata',
      submittedTooQuickly: 'Vänligen vänta lite innan du skickar formuläret',
      formExpired: 'Formuläret har gått ut. Vänligen ladda om sidan.',
      validationFailed: 'Validering misslyckades',
      captchaFailed: 'CAPTCHA-verifiering misslyckades. Vänligen försök igen.',
      messageSent: 'Meddelandet skickades!',
      sendFailed: 'Kunde inte skicka meddelandet. Försök igen senare.',
    },
  };
  return messages[locale as keyof typeof messages] || messages.no;
}

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  'cf-turnstile-response': z.string().min(1),
  honeypot: z.string().optional(),
  formLoadTime: z.number(),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { name, email, message, 'cf-turnstile-response': turnstileToken, honeypot, formLoadTime, locale = 'no' } = parsed.data;
    const errorMessages = getErrorMessages(locale);

    // --- TIME-BASED VALIDATION ---
    // Check submission timing - bots often submit instantly, humans take at least 3 seconds
    const currentTime = Date.now();
    const timeDiff = (currentTime - formLoadTime) / 1000; // Convert to seconds

    if (timeDiff < 3) {
      console.warn(`Form submitted too quickly: ${timeDiff.toFixed(2)}s - potential bot detected`);
      return NextResponse.json(
        { error: errorMessages.submittedTooQuickly },
        { status: 400 }
      );
    }

    if (timeDiff > 1800) { // 30 minutes
      console.warn(`Form submission timeout: ${timeDiff.toFixed(2)}s`);
      return NextResponse.json(
        { error: errorMessages.formExpired },
        { status: 400 }
      );
    }

    // --- HONEYPOT VALIDATION ---
    // Check honeypot field - if filled, it's likely a bot
    if (!validateHoneypot(honeypot)) {
      console.warn('Honeypot validation failed - potential bot detected');
      return NextResponse.json({ error: errorMessages.validationFailed }, { status: 400 });
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
        { error: errorMessages.captchaFailed },
        { status: 400 }
      );
    }

    // Get locale-aware email templates
    const emailTemplates = getContactEmailTemplates(locale);

    // Create email promises
    const sendAdminEmail = resend.emails.send({
      from: 'Kontaktskjema <noreply@tegnogfarge.no>',
      to: adminEmail,
      subject: emailTemplates.admin.subject(name),
      reply_to: email,
      html: emailTemplates.admin.body(name, email, message),
    });

    const sendUserConfirmationEmail = resend.emails.send({
        from: 'TegnOgFarge.no <noreply@tegnogfarge.no>',
        to: email,
        subject: emailTemplates.user.subject,
        html: emailTemplates.user.body(name, message),
    });

    // Await both promises concurrently
    await Promise.all([sendAdminEmail, sendUserConfirmationEmail]);

    return NextResponse.json({ message: errorMessages.messageSent });
  } catch (error) {
    console.error('Error sending contact email:', error);
    // Try to get locale from error context, fallback to Norwegian
    const errorMessages = getErrorMessages('no');
    return NextResponse.json({ error: errorMessages.sendFailed }, { status: 500 });
  }
} 