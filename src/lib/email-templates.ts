export interface EmailTemplateProps {
  verificationCode: string;
  baseUrl: string;
  userName?: string;
  emailAddress: string;
  unsubscribeToken?: string;
}

export const userVerificationTemplate = ({ verificationCode, baseUrl, userName, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft din e-postadresse - TegnOgFarge.no',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Velkommen til TegnOgFarge.no!</h1>
        <p>Hei ${userName || 'der'},</p>
        <p>Takk for at du registrerte deg på TegnOgFarge.no! For å fullføre registreringen, bruk følgende kode for å bekrefte din e-postadresse:</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background-color: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block;">
            ${verificationCode}
          </div>
        </div>

        <p style="text-align: center;">
          Gå til <a href="${baseUrl}/verify-email" style="color: #4F46E5; text-decoration: underline;">verifiseringssiden</a> og skriv inn koden over.
        </p>

        <p style="color: #666; font-size: 14px;">
          Denne koden utløper om 24 timer. Hvis du ikke registrerte deg på TegnOgFarge.no, kan du ignorere denne e-posten.
        </p>

        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 TegnOgFarge.no. Alle rettigheter reservert.</p>
      </div>
    `
  };
};

export const newsletterVerificationTemplate = ({ verificationCode, baseUrl, emailAddress, unsubscribeToken }: EmailTemplateProps) => {
  const verificationUrl = `${baseUrl}/api/newsletter/verify?token=${verificationCode}`;
  const unsubscribeUrl = unsubscribeToken ? `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}` : '';

  return {
    subject: 'Bekreft ditt abonnement - TegnOgFarge.no',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #264653; font-size: 24px; margin-bottom: 20px;">Bekreft ditt abonnement</h1>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hei!
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Du har meldt deg på vårt nyhetsbrev med e-postadressen <strong>${emailAddress}</strong>.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Klikk på knappen nedenfor for å bekrefte abonnementet:
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}"
             style="display: inline-block; background-color: #E76F51; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Bekreft mitt abonnement
          </a>
        </div>

        <!-- Alternative: Copy URL -->
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            Eller kopier denne lenken direkte i nettleseren din:
          </p>
          <p style="font-size: 12px; word-break: break-all; color: #E76F51; font-family: monospace;">
            ${verificationUrl}
          </p>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          Denne lenken utløper om 72 timer. Hvis du ikke meldte deg på vårt nyhetsbrev, kan du ignorere denne e-posten.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <!-- Footer with unsubscribe link -->
        <div style="text-align: center;">
          <p style="color: #999; font-size: 12px; margin-bottom: 10px;">
            © 2025 TegnOgFarge.no. Alle rettigheter reservert.
          </p>
          ${unsubscribeUrl ? `
          <p style="color: #999; font-size: 11px; margin-top: 10px;">
            Ønsker du ikke å motta e-poster fra oss? <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Meld deg av her</a>
          </p>
          ` : ''}
        </div>
      </div>
    `
  };
};

// Contact form email templates with locale support

interface ContactEmailTemplates {
  admin: {
    subject: (name: string) => string;
    body: (name: string, email: string, message: string) => string;
  };
  user: {
    subject: string;
    body: (name: string, message: string) => string;
  };
}

const contactEmailTemplates: Record<string, ContactEmailTemplates> = {
  no: {
    admin: {
      subject: (name: string) => `Ny henvendelse fra kontaktskjema: ${name}`,
      body: (name: string, email: string, message: string) => `
        <h1>Ny henvendelse fra kontaktskjema på TegnOgFarge.no</h1>
        <p><strong>Navn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <hr>
        <p><strong>Melding:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    },
    user: {
      subject: 'Vi har mottatt din henvendelse!',
      body: (name: string, message: string) => `
        <h1>Takk, ${name}!</h1>
        <p>Vi har mottatt henvendelsen din og vil svare deg så snart som mulig.</p>
        <p>Her er en kopi av meldingen du sendte:</p>
        <blockquote style="border-left: 2px solid #cccccc; padding-left: 1rem; margin-left: 1rem; color: #666666;">
          <p style="white-space: pre-wrap;">${message}</p>
        </blockquote>
        <p>Med vennlig hilsen,<br>Teamet hos TegnOgFarge.no</p>
      `,
    },
  },
  sv: {
    admin: {
      subject: (name: string) => `Ny förfrågan från kontaktformulär: ${name}`,
      body: (name: string, email: string, message: string) => `
        <h1>Ny förfrågan från kontaktformuläret på TegnOgFarge.no</h1>
        <p><strong>Namn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <hr>
        <p><strong>Meddelande:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    },
    user: {
      subject: 'Vi har mottagit din förfrågan!',
      body: (name: string, message: string) => `
        <h1>Tack, ${name}!</h1>
        <p>Vi har mottagit din förfrågan och kommer att svara dig så snart som möjligt.</p>
        <p>Här är en kopia av meddelandet du skickade:</p>
        <blockquote style="border-left: 2px solid #cccccc; padding-left: 1rem; margin-left: 1rem; color: #666666;">
          <p style="white-space: pre-wrap;">${message}</p>
        </blockquote>
        <p>Med vänliga hälsningar,<br>Teamet på TegnOgFarge.no</p>
      `,
    },
  },
};

export function getContactEmailTemplates(locale: string): ContactEmailTemplates {
  return contactEmailTemplates[locale] || contactEmailTemplates.no;
}
