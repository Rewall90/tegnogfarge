export interface EmailTemplateProps {
  verificationCode: string;
  baseUrl: string;
  userName?: string;
  emailAddress: string;
}

export const userVerificationTemplate = ({ verificationCode, baseUrl, userName, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft din e-postadresse - Fargelegg Nå',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Velkommen til Fargelegg Nå!</h1>
        <p>Hei ${userName || 'der'},</p>
        <p>Takk for at du registrerte deg på Fargelegg Nå! For å fullføre registreringen, bruk følgende kode for å bekrefte din e-postadresse:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background-color: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block;">
            ${verificationCode}
          </div>
        </div>
        
        <p style="text-align: center;">
          Gå til <a href="${baseUrl}/verify-email" style="color: #4F46E5; text-decoration: underline;">verifiseringssiden</a> og skriv inn koden over.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Denne koden utløper om 24 timer. Hvis du ikke registrerte deg på Fargelegg Nå, kan du ignorere denne e-posten.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 Fargelegg Nå. Alle rettigheter reservert.</p>
      </div>
    `
  };
};

export const newsletterVerificationTemplate = ({ verificationCode, baseUrl, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft nyhetsbrev-abonnement - Fargelegg Nå',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Bekreft ditt nyhetsbrev-abonnement</h1>
        <p>Hei!</p>
        <p>Du har meldt deg på vårt nyhetsbrev med e-postadressen <strong>${emailAddress}</strong>.</p>
        <p>For å bekrefte abonnementet og begynne å motta våre oppdateringer, bruk følgende kode:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background-color: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block;">
            ${verificationCode}
          </div>
        </div>
        
        <p style="text-align: center;">
          Gå til <a href="${baseUrl}/verify-newsletter" style="color: #10B981; text-decoration: underline;">verifiseringssiden</a> og skriv inn koden over.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Denne koden utløper om 72 timer. Hvis du ikke meldte deg på vårt nyhetsbrev, kan du ignorere denne e-posten.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 Fargelegg Nå. Alle rettigheter reservert.</p>
      </div>
    `
  };
}; 