import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

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
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
      return NextResponse.json({ error: `Invalid input: ${errorMessages}` }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

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