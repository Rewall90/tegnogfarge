import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from './db';
import { userVerificationTemplate, newsletterVerificationTemplate } from './email-templates';
import { createVerificationToken } from '../lib/tokens';
import VerifyEmailTemplate from "@/emails/VerifyEmailTemplate";
import { render } from "@react-email/render";

// Initier Resend med API-nøkkel
const resend = new Resend(process.env.RESEND_API_KEY);

// Verifiser at API-nøkkelen er satt
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY er ikke satt i miljøvariablene. E-poster vil ikke bli sendt.');
}

interface SendVerificationEmailOptions {
  email: string;
  type: 'user_verification' | 'newsletter_verification';
  userName?: string;
}

// Define error interface for better typing
interface ResendAPIError {
  statusCode?: number;
  message: string;
  code?: string;
  stack?: string;
  verificationUrl?: string;
}

export class EmailService {
  private static async generateVerificationToken(email: string, type: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    
    if (type === 'user_verification') {
      expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS || '24'));
    } else {
      expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.NEWSLETTER_VERIFICATION_TOKEN_EXPIRES_HOURS || '72'));
    }

    const client = await clientPromise;
    const db = client.db('fargeleggingsapp');
    
    await db.collection('verification_tokens').insertOne({
      email,
      token,
      type,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    return token;
  }

  static async sendUserVerificationEmail({ email, userName }: { email: string; userName: string }) {
    try {
      // Sjekk miljøvariabler
      if (!process.env.NEXTAUTH_URL) {
        throw new Error('NEXTAUTH_URL er ikke definert i miljøvariablene');
      }
      
      // Oppretter en verifiseringskode
      const verificationToken = await createVerificationToken({ email });
      
      if (!verificationToken?.token) {
        throw new Error('Kunne ikke opprette verifiseringskode');
      }
      
      // Bygger verifikasjonslenken (fortsatt tilgjengelig, men ikke vist i e-post)
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken.token}`;
      
      // Verifiseringskoden som skal vises i e-posten
      const verificationCode = verificationToken.token;
      
      // Bruk en enklere e-postmal som viser koden i stedet for lenken
      const firstName = userName ? userName.split(' ')[0] : 'der';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Bekreft e-postadressen din</title>
          </head>
          <body style="font-family: sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h1 style="text-align: center; color: #333;">Bekreft e-postadressen din</h1>
              <p>Hei ${firstName}!</p>
              <p>Takk for at du registrerte deg på Fargelegging.no. For å fullføre registreringen og få tilgang til alle funksjoner, må du bekrefte e-postadressen din med koden nedenfor.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background-color: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block;">
                  ${verificationCode}
                </div>
              </div>
              
              <p style="text-align: center;">Gå til <a href="${baseUrl}/verify-email">verifiseringssiden</a> og skriv inn koden over.</p>
              
              <hr style="margin: 30px 0; border-color: #e6e6e6;">
              <p style="font-size: 13px; color: #888;">Hvis du ikke registrerte deg på Fargelegging.no, kan du trygt ignorere denne e-posten.</p>
              <p style="font-size: 13px; color: #888;">Denne e-posten ble sendt fra en avsender som ikke tar imot svar. Vennligst ikke svar på denne meldingen.</p>
            </div>
          </body>
        </html>
      `;
      
      // Sjekk om Resend-nøkkelen er satt
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY mangler - hopper over sending av e-post i utviklingsmodus');
        // Returner et objekt med verifikasjonslenken for utvikling
        return { 
          success: false, 
          reason: 'missing_api_key', 
          verificationCode,
          verificationUrl 
        };
      }
      
      // I utviklingsmodus, omdiriger til testadresse hvis konfigurert
      let recipientEmail = email;
      if (process.env.NODE_ENV === 'development' && process.env.DEV_TEST_EMAIL) {
        recipientEmail = process.env.DEV_TEST_EMAIL;
      }
      
      const result = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || 'Fargelegg Nå'} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: recipientEmail,
        subject: 'Bekreft e-postadressen din',
        html: htmlContent,
      });
      
      // Returner resultat og verifiseringskoden (for utvikling)
      return { 
        success: true, 
        messageId: result.data?.id,
        verificationCode,
        verificationUrl // Inkluder fortsatt for utviklingsformål
      };
    } catch (error: unknown) {
      const typedError = error as ResendAPIError;
      console.error('Feil ved sending av verifikasjons-e-post:', typedError);
      // Logg detaljert feilmelding for debugging
      console.error('Feildetaljer:', {
        message: typedError.message,
        stack: typedError.stack,
        code: typedError.code,
        statusCode: typedError.statusCode
      });
      
      // Returner et objekt med feilinformasjon
      return { 
        success: false, 
        reason: 'error', 
        error: typedError.message,
        // Hvis verifikasjonslenke er opprettet, returner den for utviklingsformål
        verificationUrl: typedError.verificationUrl
      };
    }
  }

  static async sendNewsletterVerificationEmail({ email }: { email: string }) {
    try {
      const token = await this.generateVerificationToken(email, 'newsletter_verification');
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-newsletter?token=${token}`;
      
      // Bruk en enklere e-postmal
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Bekreft ditt nyhetsbrevabonnement</title>
          </head>
          <body style="font-family: sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h1 style="text-align: center; color: #333;">Bekreft ditt nyhetsbrevabonnement</h1>
              <p>Hei!</p>
              <p>Takk for at du meldte deg på vårt nyhetsbrev. For å fullføre registreringen, må du bekrefte e-postadressen din ved å klikke på knappen nedenfor.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Bekreft mitt abonnement</a>
              </div>
              <p>Eller kopier og lim inn følgende URL i nettleseren din:</p>
              <div style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
                ${verificationUrl}
              </div>
              <hr style="margin: 30px 0; border-color: #e6e6e6;">
              <p style="font-size: 13px; color: #888;">Hvis du ikke meldte deg på vårt nyhetsbrev, kan du trygt ignorere denne e-posten.</p>
            </div>
          </body>
        </html>
      `;

      // In development, use either DEV_TEST_EMAIL or Resend's test email
      let recipientEmail = email;
      
      if (process.env.NODE_ENV === 'development') {
        // Use the verified email from Resend account if specified
        if (process.env.DEV_TEST_EMAIL) {
          recipientEmail = process.env.DEV_TEST_EMAIL;
        } 
        // Alternatively, use Resend's test address for successful delivery
        else {
          recipientEmail = 'delivered@resend.dev';
        }
      }

      const result = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || 'Fargelegg Nå'} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: recipientEmail,
        subject: 'Bekreft ditt nyhetsbrevabonnement',
        html: htmlContent,
      });
      
      return { success: true, messageId: result.data?.id, verificationUrl };
    } catch (error: unknown) {
      const typedError = error as ResendAPIError;
      console.error('Failed to send newsletter verification email:', typedError);
      throw new Error('Failed to send verification email');
    }
  }

  static async verifyToken(token: string, type: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const client = await clientPromise;
      const db = client.db('fargeleggingsapp');
      
      // Forsøk å finne token i databasen
      const tokenDoc = await db.collection('verification_tokens').findOne({
        token,
        type,
        used: false,
        expiresAt: { $gt: new Date() }
      });
      
      if (!tokenDoc) {
        return { valid: false };
      }
      
      // Marker token som brukt
      await db.collection('verification_tokens').updateOne(
        { _id: tokenDoc._id },
        { $set: { used: true, usedAt: new Date() } }
      );
      
      return { valid: true, email: tokenDoc.email };
    } catch (error: unknown) {
      console.error('Feil ved validering av token:', error);
      return { valid: false };
    }
  }
} 