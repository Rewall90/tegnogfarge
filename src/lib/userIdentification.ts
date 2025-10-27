/**
 * User Identification Utility
 *
 * Generates a consistent identifier for tracking unique downloads per user.
 * Priority:
 * 1. Email (if user is verified subscriber)
 * 2. Browser fingerprint (for anonymous users)
 */

/**
 * Generate a browser fingerprint from various browser properties
 * This creates a reasonably unique ID for anonymous users
 */
function generateFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    // Include canvas fingerprint for better uniqueness
    getCanvasFingerprint()
  ].join('|');

  // Simple hash function
  return simpleHash(data);
}

/**
 * Get canvas fingerprint for better uniqueness
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#069';
    ctx.fillText('Hello, World!', 2, 2);

    return canvas.toDataURL().slice(-50); // Last 50 chars
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * Simple hash function (djb2 algorithm)
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get verified email from localStorage
 * (Set when user verifies their email through newsletter signup)
 */
function getVerifiedEmail(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Check if user has verified email stored
    const verifiedEmail = localStorage.getItem('verified_email');
    return verifiedEmail;
  } catch (e) {
    return null;
  }
}

/**
 * Get or create a persistent user identifier
 * Returns either the verified email or a browser fingerprint
 */
export function getUserIdentifier(): string {
  if (typeof window === 'undefined') return 'server';

  // Priority 1: Use verified email if available
  const email = getVerifiedEmail();
  if (email) {
    return `email:${email}`;
  }

  // Priority 2: Use stored fingerprint or generate new one
  const STORAGE_KEY = 'user_fingerprint';

  try {
    let fingerprint = localStorage.getItem(STORAGE_KEY);

    if (!fingerprint) {
      fingerprint = generateFingerprint();
      localStorage.setItem(STORAGE_KEY, fingerprint);
    }

    return `fingerprint:${fingerprint}`;
  } catch (e) {
    // If localStorage fails, generate temporary fingerprint
    return `fingerprint:${generateFingerprint()}`;
  }
}

/**
 * Store verified email when user completes email verification
 * Call this after successful newsletter verification
 */
export function setVerifiedEmail(email: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('verified_email', email);
  } catch (e) {
    console.error('Failed to store verified email:', e);
  }
}

/**
 * Clear verified email (for testing or when user unsubscribes)
 */
export function clearVerifiedEmail(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('verified_email');
  } catch (e) {
    console.error('Failed to clear verified email:', e);
  }
}
