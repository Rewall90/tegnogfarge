/**
 * Sanity Client for Translation Script
 * Requires a write token with permissions to create and update documents
 */

import { createClient, type SanityClient } from '@sanity/client';
import { TRANSLATION_CONFIG } from './config';
import { resolveAllReferences, checkMissingReferences } from './reference-resolver';
import type {
  CategoryDocument,
  SubcategoryDocument,
  DrawingDocument,
  DocumentType
} from './types';

let client: SanityClient | null = null;

/**
 * Initialize Sanity client with write token
 */
export function initSanityClient(): SanityClient {
  const token = process.env.SANITY_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      'SANITY_WRITE_TOKEN environment variable is required.\n' +
      'Create a token at: https://www.sanity.io/manage/personal/tokens\n' +
      'Required permissions: Editor or Admin'
    );
  }

  client = createClient({
    projectId: TRANSLATION_CONFIG.SANITY_PROJECT_ID,
    dataset: TRANSLATION_CONFIG.SANITY_DATASET,
    apiVersion: TRANSLATION_CONFIG.SANITY_API_VERSION,
    token,
    useCdn: false, // Don't use CDN for mutations
  });

  return client;
}

/**
 * Get Sanity client instance
 */
export function getSanityClient(): SanityClient {
  if (!client) {
    return initSanityClient();
  }
  return client;
}

/**
 * Fetch all documents of a specific type in the source language
 */
export async function fetchSourceDocuments(
  documentType: DocumentType,
  sourceLanguage: string = 'no'
): Promise<Array<CategoryDocument | SubcategoryDocument | DrawingDocument>> {
  const client = getSanityClient();

  // Only fetch active published documents (exclude drafts)
  const query = `*[_type == $documentType && language == $language && isActive == true && !(_id in path("drafts.**"))] | order(_createdAt asc)`;

  const documents = await client.fetch(query, {
    documentType,
    language: sourceLanguage,
  });

  console.log(`✓ Fetched ${documents.length} active ${documentType} documents in ${sourceLanguage}`);

  return documents;
}

/**
 * Check if a Swedish translation already exists for a document
 * FIXED: Query using baseDocumentId for reliable cross-session detection
 *
 * @deprecated Use fetchAllTranslatedIds() for bulk checking - much faster!
 */
export async function translationExists(
  baseDocumentId: string,
  documentType: DocumentType,
  targetLanguage: string = 'sv'
): Promise<boolean> {
  const client = getSanityClient();

  // Query by baseDocumentId - this is reliable even after titles/slugs are translated
  const count = await client.fetch(
    `count(*[
      _type == $documentType &&
      language == $targetLanguage &&
      baseDocumentId == $baseDocumentId
    ])`,
    {
      documentType,
      targetLanguage,
      baseDocumentId,
    }
  );

  return count > 0;
}

/**
 * OPTIMIZED: Fetch all translated document IDs in one bulk query
 * Returns a Set of baseDocumentIds that have been translated
 *
 * This is MUCH faster than calling translationExists() for each document:
 * - Before: N individual queries (one per document)
 * - After: 1 bulk query + in-memory Set lookup
 */
export async function fetchAllTranslatedIds(
  documentType: DocumentType,
  targetLanguage: string = 'sv'
): Promise<Set<string>> {
  const client = getSanityClient();

  // Fetch all translations with their baseDocumentId in one query
  const translations = await client.fetch(
    `*[_type == $documentType && language == $targetLanguage]{baseDocumentId}`,
    { documentType, targetLanguage }
  );

  // Build a Set for O(1) lookup speed
  const translatedIds = new Set<string>();
  translations.forEach((doc: any) => {
    if (doc.baseDocumentId) {
      translatedIds.add(doc.baseDocumentId);
    }
  });

  console.log(`  ✓ Found ${translatedIds.size} existing ${targetLanguage} translations (bulk query)`);

  return translatedIds;
}

/**
 * Create a Swedish translation document
 * Uses Sanity's document internationalization plugin conventions
 */
export async function createTranslationDocument(
  baseDocument: CategoryDocument | SubcategoryDocument | DrawingDocument,
  translatedFields: Record<string, any>,
  targetLanguage: string = 'sv',
  dryRun: boolean = false
): Promise<{ _id: string } | null> {
  // Check for missing referenced translations
  const missingRefs = await checkMissingReferences(baseDocument, targetLanguage);
  if (missingRefs.length > 0) {
    console.warn(`  ⚠ WARNING: Document has untranslated references:`);
    missingRefs.forEach(ref => console.warn(`    - ${ref}`));
    console.warn(`  ℹ These will keep Norwegian references. Translate parent documents first!`);
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would create translation for ${baseDocument._id}`);
    console.log('Translated fields:', JSON.stringify(translatedFields, null, 2));

    // Show what references would be resolved
    const resolvedDoc = await resolveAllReferences(baseDocument, targetLanguage);
    if (JSON.stringify(baseDocument) !== JSON.stringify(resolvedDoc)) {
      console.log('References that would be updated:');
      for (const key of Object.keys(baseDocument)) {
        if (baseDocument[key]?._ref !== resolvedDoc[key]?._ref) {
          console.log(`  ${key}: ${baseDocument[key]?._ref} → ${resolvedDoc[key]?._ref}`);
        }
      }
    }

    return { _id: `${baseDocument._id}-${targetLanguage}-dryrun` };
  }

  const client = getSanityClient();

  // DOUBLE-CHECK: Re-verify translation doesn't exist right before creation
  // This minimizes race condition window
  const existingTranslations = await client.fetch(
    `*[_type == "${baseDocument._type}" && language == $targetLanguage && baseDocumentId == $baseDocumentId]{_id}`,
    {
      targetLanguage,
      baseDocumentId: baseDocument._id,
    }
  );

  if (existingTranslations.length > 0) {
    console.log(`  ⊘ Translation already exists (race condition detected), skipping`);
    return existingTranslations[0];
  }

  // CRITICAL FIX: Resolve all references to Swedish translations
  console.log(`  🔗 Resolving references to Swedish documents...`);
  const resolvedBaseDocument = await resolveAllReferences(baseDocument, targetLanguage);

  // Create the translated document
  // Copy all fields from resolved base document, then override with translations
  const translatedDocument = {
    ...resolvedBaseDocument,
    ...translatedFields,
    _type: baseDocument._type, // CRITICAL: Must be AFTER translatedFields to prevent overwrite
    _id: undefined, // Let Sanity generate new ID
    _rev: undefined, // Don't copy revision
    language: targetLanguage,
    baseDocumentId: baseDocument._id, // CRITICAL: Link back to Norwegian original for cross-session lookups
  };

  try {
    const result = await client.create(translatedDocument);
    console.log(`  ✓ Created translation ${result._id} for ${baseDocument._id}`);

    // VERIFICATION: Check if duplicate was created simultaneously by another process
    // Wait a moment for database to sync
    await new Promise(resolve => setTimeout(resolve, 100));

    const allTranslations = await client.fetch(
      `*[_type == "${baseDocument._type}" && language == $targetLanguage && baseDocumentId == $baseDocumentId] | order(_createdAt asc)`,
      {
        targetLanguage,
        baseDocumentId: baseDocument._id,
      }
    );

    if (allTranslations.length > 1) {
      // Duplicate detected! Keep the first one, delete ours if we're not first
      const firstId = allTranslations[0]._id;
      if (result._id !== firstId) {
        console.warn(`  ⚠ Duplicate detected! Deleting our copy ${result._id}, keeping ${firstId}`);
        await client.delete(result._id);
        return allTranslations[0];
      } else {
        // We're the first, delete the others
        console.warn(`  ⚠ Duplicate detected! Deleting ${allTranslations.length - 1} later copy/copies`);
        for (let i = 1; i < allTranslations.length; i++) {
          await client.delete(allTranslations[i]._id);
        }
      }
    }

    return result;
  } catch (error) {
    console.error(`  ✗ Failed to create translation for ${baseDocument._id}:`, error);
    throw error;
  }
}

/**
 * Get translation statistics
 */
export async function getTranslationStats(documentType: DocumentType): Promise<{
  total: number;
  norwegian: number;
  swedish: number;
  missing: number;
}> {
  const client = getSanityClient();

  const [total, norwegian, swedish] = await Promise.all([
    client.fetch(`count(*[_type == $documentType])`, { documentType }),
    client.fetch(`count(*[_type == $documentType && language == "no"])`, { documentType }),
    client.fetch(`count(*[_type == $documentType && language == "sv"])`, { documentType }),
  ]);

  return {
    total,
    norwegian,
    swedish,
    missing: norwegian - swedish,
  };
}
