import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from './db';
import { userVerificationTemplate, newsletterVerificationTemplate } from './email-templates';
import { createVerificationToken } from "./tokens";
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
      console.log(`Starter sendUserVerificationEmail for ${email}`);
      
      // Sjekk miljøvariabler
      if (!process.env.NEXTAUTH_URL) {
        throw new Error('NEXTAUTH_URL er ikke definert i miljøvariablene');
      }
      
      // Oppretter en verifikasjonstoken
      console.log('Oppretter verifikasjonstoken...');
      const verificationToken = await createVerificationToken({ email });
      
      if (!verificationToken?.token) {
        throw new Error('Kunne ikke opprette verifikasjonstoken');
      }
      
      // Bygger verifikasjonslenken
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken.token}`;
      console.log(`Verifikasjonslenke opprettet: ${verificationUrl}`);
      
      // Rendrer e-postmalen
      console.log('Rendrer e-postmal...');
      const htmlContent = render(VerifyEmailTemplate({ 
        userFirstname: userName.split(' ')[0], 
        verificationUrl 
      }));
      
      // Sender e-posten via Resend
      console.log('Sender e-post via Resend...');
      
      // Sjekk om Resend-nøkkelen er satt
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY mangler - hopper over sending av e-post i utviklingsmodus');
        // Returner et objekt med verifikasjonslenken for utvikling
        return { success: false, reason: 'missing_api_key', verificationUrl };
      }
      
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'no-reply@fargelegging.no',
        to: email,
        subject: 'Bekreft e-postadressen din',
        html: htmlContent,
      });
      
      console.log('E-post sendt, resultat:', result);
      
      // Returner resultat og verifikasjonslenken (for utvikling)
      return { 
        success: true, 
        messageId: result.data?.id,
        verificationUrl // Inkluder for utvikling
      };
    } catch (error: any) {
      console.error('Feil ved sending av verifikasjons-e-post:', error);
      // Logg detaljert feilmelding for debugging
      console.error('Feildetaljer:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode
      });
      
      // Returner et objekt med feilinformasjon
      return { 
        success: false, 
        reason: 'error', 
        error: error.message,
        // Hvis verifikasjonslenke er opprettet, returner den for utviklingsformål
        verificationUrl: error.verificationUrl
      };
    }
  }

  static async sendNewsletterVerificationEmail({ email }: { email: string }) {
    try {
      const token = await this.generateVerificationToken(email, 'newsletter_verification');
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-newsletter?token=${token}`;
      
      const template = newsletterVerificationTemplate({ 
        verificationUrl, 
        emailAddress: email 
      });

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
        
        console.log(`DEVELOPMENT MODE: Original recipient: ${email}, Using: ${recipientEmail}`);
        console.log(`Verification URL: ${verificationUrl}`);
      }

      const result = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
      });

      console.log(`Newsletter verification email sent to ${recipientEmail} (original: ${email})`);
      console.log(`Email result:`, result);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`DEVELOPMENT: For testing, access this URL to verify: ${verificationUrl}`);
      }
      
      return { success: true, messageId: result.data?.id, verificationUrl };
    } catch (error) {
      console.error('Failed to send newsletter verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async verifyToken(token: string, type: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const client = await clientPromise;
      const db = client.db('fargeleggingsapp');
      
      const tokenDoc = await db.collection('verification_tokens').findOne({
        token,
        type,
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenDoc) {
        return { valid: false };
      }

      // Mark token as used
      await db.collection('verification_tokens').updateOne(
        { _id: tokenDoc._id },
        { $set: { used: true, usedAt: new Date() } }
      );

      return { valid: true, email: tokenDoc.email };
    } catch (error) {
      console.error('Failed to verify token:', error);
      return { valid: false };
    }
  }
} 