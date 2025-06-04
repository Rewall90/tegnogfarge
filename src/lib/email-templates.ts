export interface EmailTemplateProps {
  verificationUrl: string;
  userName?: string;
  emailAddress: string;
}

export const userVerificationTemplate = ({ verificationUrl, userName, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft din e-postadresse - Fargelegg Nå',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Velkommen til Fargelegg Nå!</h1>
        <p>Hei ${userName || 'der'},</p>
        <p>Takk for at du registrerte deg på Fargelegg Nå! For å fullføre registreringen, vennligst bekreft din e-postadresse ved å klikke på lenken nedenfor:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Bekreft e-postadresse
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Hvis du ikke kan klikke på knappen, kopier og lim inn denne lenken i nettleseren din:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Denne lenken utløper om 24 timer. Hvis du ikke registrerte deg på Fargelegg Nå, kan du ignorere denne e-posten.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 Fargelegg Nå. Alle rettigheter reservert.</p>
      </div>
    `
  };
};

export const newsletterVerificationTemplate = ({ verificationUrl, emailAddress }: EmailTemplateProps) => {
  return {
    subject: 'Bekreft nyhetsbrev-abonnement - Fargelegg Nå',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Bekreft ditt nyhetsbrev-abonnement</h1>
        <p>Hei!</p>
        <p>Du har meldt deg på vårt nyhetsbrev med e-postadressen <strong>${emailAddress}</strong>.</p>
        <p>For å bekrefte abonnementet og begynne å motta våre oppdateringer, klikk på lenken nedenfor:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Bekreft abonnement
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Hvis du ikke kan klikke på knappen, kopier og lim inn denne lenken i nettleseren din:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Denne lenken utløper om 72 timer. Hvis du ikke meldte deg på vårt nyhetsbrev, kan du ignorere denne e-posten.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">© 2025 Fargelegg Nå. Alle rettigheter reservert.</p>
      </div>
    `
  };
}; 