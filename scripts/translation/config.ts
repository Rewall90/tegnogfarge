/**
 * Translation Configuration
 */

export const TRANSLATION_CONFIG = {
  // Source and target languages
  SOURCE_LANGUAGE: 'no' as const,
  TARGET_LANGUAGE: 'sv' as const,

  // Sanity configuration
  SANITY_PROJECT_ID: 'fn0kjvlp',
  SANITY_DATASET: 'production',
  SANITY_API_VERSION: '2024-01-13',

  // OpenAI configuration
  OPENAI_MODEL: 'gpt-4o', // Latest GPT-4 model for best translations
  OPENAI_TEMPERATURE: 0.3, // Lower temperature for more consistent translations
  OPENAI_MAX_TOKENS: 2000,

  // Document types to translate (in priority order)
  DOCUMENT_TYPES: [
    'category',      // ~12 documents
    'subcategory',   // ~50 documents
    'drawingImage',  // ~200 documents
  ] as const,

  // Fields to translate per document type
  TRANSLATABLE_FIELDS: {
    category: [
      'title',
      'slug.current',  // ← CRITICAL: Translate URLs to Swedish!
      'description',
      'seoTitle',
      'seoDescription',
      'image.alt',
    ],
    subcategory: [
      'title',
      'slug.current',  // ← CRITICAL: Translate URLs to Swedish!
      'description',
      'seoTitle',
      'seoDescription',
      'featuredImage.alt',
    ],
    drawingImage: [
      'title',
      'slug.current',  // ← CRITICAL: Translate URLs to Swedish!
      'description',
      'metaDescription',
      'contextContent', // Portable text - needs special handling
      'displayImage.alt',
      'thumbnailImage.alt',
      'webpImage.alt',
      'seo.metaTitle',
      'seo.metaDescription',
    ],
  },

  // Processing options
  BATCH_SIZE: 5, // Process N documents at a time to avoid rate limits
  DELAY_BETWEEN_BATCHES_MS: 2000, // Wait between batches
  DELAY_BETWEEN_REQUESTS_MS: 500, // Wait between individual API calls
  MAX_RETRIES: 3, // Retry failed translations N times

  // Validation
  MIN_TRANSLATION_LENGTH: 2, // Minimum characters for valid translation
  MAX_TRANSLATION_RATIO: 3, // Max ratio between source and translation length

  // Logging
  VERBOSE: true, // Detailed logging
  LOG_FILE: 'translation-log.json',
} as const;

export type DocumentType = typeof TRANSLATION_CONFIG.DOCUMENT_TYPES[number];
