export const SANITY_DRAFT_MODE_SECRET = process.env.SANITY_DRAFT_MODE_SECRET

// Validere at miljøvariabelen eksisterer
if (!SANITY_DRAFT_MODE_SECRET) {
  throw new Error('Missing SANITY_DRAFT_MODE_SECRET in .env.local')
} 