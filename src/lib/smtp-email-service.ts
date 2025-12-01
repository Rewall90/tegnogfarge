import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * SMTP Email Service
 *
 * Sends emails via your own SMTP server (Dedia hosting)
 * Better deliverability than third-party services
 * Allows users to reply directly to petter@tegnogfarge.no
 */

let transporter: Transporter | null = null;

/**
 * Get or create SMTP transporter
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // Validate SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.');
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Optional: Configure connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
  });

  console.log('[SMTP] Transporter created with host:', process.env.SMTP_HOST);

  return transporter;
}

/**
 * Verify SMTP connection
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const smtp = getTransporter();
    await smtp.verify();
    console.log('[SMTP] Connection verified successfully');
    return true;
  } catch (error) {
    console.error('[SMTP] Connection verification failed:', error);
    return false;
  }
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

/**
 * Send email via SMTP
 */
export async function sendSmtpEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const smtp = getTransporter();

    // Default from address
    const fromAddress = options.from || process.env.SMTP_FROM || `${process.env.SMTP_FROM_NAME || 'TegnOgFarge.no'} <${process.env.SMTP_USER}>`;

    // Default reply-to (so users can respond)
    const replyTo = options.replyTo || process.env.SMTP_USER;

    const mailOptions = {
      from: fromAddress,
      replyTo,
      to: options.to,
      subject: options.subject,
      html: options.html,
      headers: options.headers,
    };

    console.log('[SMTP] Sending email to:', options.to);

    const info = await smtp.sendMail(mailOptions);

    console.log('[SMTP] Email sent successfully. Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('[SMTP] Failed to send email:', typedError);
    return {
      success: false,
      error: typedError.message,
    };
  }
}

/**
 * Send campaign email to multiple recipients (with rate limiting)
 */
export async function sendCampaignEmails(
  recipients: string[],
  subject: string,
  htmlTemplate: (email: string) => string,
  options?: {
    batchSize?: number;
    delayMs?: number;
    unsubscribeUrl?: (email: string) => string;
  }
): Promise<{
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  const batchSize = options?.batchSize || 10;
  const delayMs = options?.delayMs || 100;

  // Process in batches to avoid overwhelming the SMTP server
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (email) => {
        try {
          const html = htmlTemplate(email);
          const headers: Record<string, string> = {};

          // Add unsubscribe header if provided
          if (options?.unsubscribeUrl) {
            const unsubUrl = options.unsubscribeUrl(email);
            headers['List-Unsubscribe'] = `<${unsubUrl}>`;
            headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
          }

          const result = await sendSmtpEmail({
            to: email,
            subject,
            html,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          });

          if (result.success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push({ email, error: result.error || 'Unknown error' });
          }

          // Small delay between emails
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } catch (error) {
          const typedError = error as Error;
          results.failed++;
          results.errors.push({ email, error: typedError.message });
        }
      })
    );

    // Delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Check if SMTP is configured
 */
export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}
