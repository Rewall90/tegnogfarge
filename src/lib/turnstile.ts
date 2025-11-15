/**
 * Cloudflare Turnstile Server-Side Validation
 *
 * This module provides server-side validation for Cloudflare Turnstile tokens.
 * Following official Cloudflare best practices:
 * - Tokens expire after 5 minutes (300 seconds)
 * - Tokens are single-use only
 * - Server-side validation is MANDATORY for security
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileValidationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

export interface TurnstileValidationResult {
  success: boolean;
  message?: string;
  errorCodes?: string[];
}

/**
 * Validates a Cloudflare Turnstile token with the Cloudflare API
 *
 * @param token - The cf-turnstile-response token from the client
 * @param remoteIp - Optional visitor IP address for additional verification
 * @returns Validation result with success status and optional error details
 *
 * @example
 * ```typescript
 * const result = await validateTurnstileToken(token, clientIp);
 * if (!result.success) {
 *   return NextResponse.json({ error: 'CAPTCHA validation failed' }, { status: 400 });
 * }
 * ```
 */
export async function validateTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileValidationResult> {
  // Validate required environment variable
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('CLOUDFLARE_TURNSTILE_SECRET_KEY is not configured');
    return {
      success: false,
      message: 'Turnstile configuration error',
    };
  }

  // Validate token format
  if (!token || typeof token !== 'string' || token.length === 0) {
    return {
      success: false,
      message: 'Invalid token format',
    };
  }

  // Validate token length (max 2048 characters per Cloudflare spec)
  if (token.length > 2048) {
    return {
      success: false,
      message: 'Token exceeds maximum length',
    };
  }

  try {
    // Prepare form data for verification
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    // Include remote IP if provided for additional verification
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    // Call Cloudflare Siteverify API
    const response = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    // Check for HTTP errors
    if (!response.ok) {
      console.error(`Turnstile API returned status ${response.status}`);
      return {
        success: false,
        message: 'Verification service error',
      };
    }

    const data = await response.json() as TurnstileValidationResponse;

    // Return validation result
    if (!data.success) {
      console.warn('Turnstile validation failed:', data['error-codes']);
      return {
        success: false,
        message: 'CAPTCHA validation failed',
        errorCodes: data['error-codes'],
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error validating Turnstile token:', error);
    return {
      success: false,
      message: 'Verification failed due to internal error',
    };
  }
}

/**
 * Validates honeypot field to catch simple bots
 *
 * @param honeypotValue - Value from the honeypot field (should be empty)
 * @returns True if honeypot check passes (field is empty)
 */
export function validateHoneypot(honeypotValue: string | null | undefined): boolean {
  // Honeypot field should be empty - if it has a value, it's likely a bot
  return !honeypotValue || honeypotValue.trim() === '';
}

/**
 * Error code reference for Cloudflare Turnstile
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes
 */
export const TURNSTILE_ERROR_CODES = {
  'missing-input-secret': 'The secret parameter was not passed.',
  'invalid-input-secret': 'The secret parameter was invalid or did not exist.',
  'missing-input-response': 'The response parameter was not passed.',
  'invalid-input-response': 'The response parameter is invalid or has expired.',
  'bad-request': 'The request was rejected because it was malformed.',
  'timeout-or-duplicate': 'The response parameter has already been validated before.',
  'internal-error': 'An internal error happened while validating the response.',
} as const;
