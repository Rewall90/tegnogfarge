/**
 * Reference Resolver
 * Finds Swedish translations of referenced Norwegian documents
 * OPTIMIZED: Uses local mapping cache instead of database queries
 */

import { getSanityClient } from './sanity-client';
import { loadProgress } from './progress-tracker';

// In-memory cache for reference mapping (Norwegian ID → Swedish ID)
let referenceCache: Map<string, string> | null = null;

/**
 * Build reference mapping from progress file
 * This avoids expensive database queries for every reference
 */
function buildReferenceMapping(): Map<string, string> {
  if (referenceCache) {
    return referenceCache;
  }

  referenceCache = new Map<string, string>();

  // Load progress from current session
  const progress = loadProgress();
  if (progress && progress.completed) {
    // Add all completed translations to cache
    for (const [originalId, translation] of Object.entries(progress.completed)) {
      referenceCache.set(originalId, translation.translatedId);
    }

    if (referenceCache.size > 0) {
      console.log(`  📋 Loaded ${referenceCache.size} reference mappings from progress`);
    }
  }

  return referenceCache;
}

/**
 * Clear the reference cache
 * Call this when starting a new document type translation
 */
export function clearReferenceCache(): void {
  referenceCache = null;
}

/**
 * Add a reference mapping to the cache
 * Called after successfully creating a translation
 */
export function addReferenceMapping(norwegianId: string, swedishId: string): void {
  const mapping = buildReferenceMapping();
  mapping.set(norwegianId, swedishId);
}

/**
 * Find the Swedish translation ID for a Norwegian document reference
 * OPTIMIZED: Checks local cache first, falls back to database query
 */
export async function resolveTranslatedReference(
  norwegianRefId: string,
  targetLanguage: string = 'sv'
): Promise<string | null> {
  // OPTIMIZED: Check in-memory cache first (instant lookup, no database query)
  const mapping = buildReferenceMapping();
  const cachedId = mapping.get(norwegianRefId);

  if (cachedId) {
    return cachedId;
  }

  // Fallback: Query database using baseDocumentId (reliable cross-session)
  const client = getSanityClient();

  // Query by baseDocumentId - this works even after titles/slugs are translated
  const swedishId = await client.fetch(
    `*[
      baseDocumentId == $norwegianId &&
      language == $targetLanguage
    ][0]._id`,
    {
      norwegianId: norwegianRefId,
      targetLanguage,
    }
  );

  if (swedishId) {
    // Cache the result for future lookups
    mapping.set(norwegianRefId, swedishId);
    return swedishId;
  }

  console.warn(`⚠ No Swedish translation found for ${norwegianRefId}`);
  return null;
}

/**
 * Recursively resolve all references in a document to their translated versions
 *
 * @param document - The document with potentially Norwegian references
 * @param targetLanguage - Target language (default: 'sv')
 * @returns Document with all references updated to Swedish versions
 */
export async function resolveAllReferences(
  document: any,
  targetLanguage: string = 'sv'
): Promise<any> {
  const resolvedDocument = { ...document };

  // Find all reference fields in the document
  for (const [key, value] of Object.entries(document)) {
    if (value && typeof value === 'object') {
      // Check if this is a Sanity reference
      if ('_ref' in value && '_type' in value && value._type === 'reference') {
        const norwegianRefId = value._ref;

        console.log(`  🔗 Resolving reference: ${key} (${norwegianRefId})`);

        const swedishRefId = await resolveTranslatedReference(norwegianRefId, targetLanguage);

        if (swedishRefId) {
          console.log(`  ✓ Updated to Swedish reference: ${swedishRefId}`);
          resolvedDocument[key] = {
            _type: 'reference',
            _ref: swedishRefId,
          };
        } else {
          console.warn(`  ⚠ Could not resolve ${key}, keeping original reference`);
          // Keep the Norwegian reference as fallback - better than breaking
          resolvedDocument[key] = value;
        }
      }
      // Recursively check nested objects
      else if (!Array.isArray(value)) {
        resolvedDocument[key] = await resolveAllReferences(value, targetLanguage);
      }
    }
  }

  return resolvedDocument;
}

/**
 * Check if all referenced documents have Swedish translations
 * Returns list of missing translations
 */
export async function checkMissingReferences(
  document: any,
  targetLanguage: string = 'sv'
): Promise<string[]> {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(document)) {
    if (value && typeof value === 'object') {
      if ('_ref' in value && '_type' in value && value._type === 'reference') {
        const norwegianRefId = value._ref;
        const swedishRefId = await resolveTranslatedReference(norwegianRefId, targetLanguage);

        if (!swedishRefId) {
          missing.push(`${key} (${norwegianRefId})`);
        }
      }
    }
  }

  return missing;
}

/**
 * Validate references for dry-run mode
 * Returns detailed validation results
 */
export async function validateReferences(
  document: any,
  documentType: string,
  targetLanguage: string = 'sv'
): Promise<{
  valid: boolean;
  missingReferences: Array<{
    fieldName: string;
    norwegianId: string;
    referenceType: string;
  }>;
}> {
  const missingReferences: Array<{
    fieldName: string;
    norwegianId: string;
    referenceType: string;
  }> = [];

  // Check all fields for references
  for (const [key, value] of Object.entries(document)) {
    if (value && typeof value === 'object' && '_ref' in value && '_type' in value && value._type === 'reference') {
      const norwegianRefId = value._ref;

      // Try to resolve the reference
      const swedishRefId = await resolveTranslatedReference(norwegianRefId, targetLanguage);

      if (!swedishRefId) {
        // Determine reference type based on document type and field name
        let referenceType = 'unknown';
        if (documentType === 'subcategory' && key === 'parentCategory') {
          referenceType = 'category';
        } else if (documentType === 'drawingImage' && key === 'subcategory') {
          referenceType = 'subcategory';
        }

        missingReferences.push({
          fieldName: key,
          norwegianId: norwegianRefId,
          referenceType,
        });
      }
    }
  }

  return {
    valid: missingReferences.length === 0,
    missingReferences,
  };
}
