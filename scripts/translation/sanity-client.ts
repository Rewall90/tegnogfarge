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

  const query = `*[_type == $documentType && language == $language] | order(_createdAt asc)`;

  const documents = await client.fetch(query, {
    documentType,
    language: sourceLanguage,
  });

  console.log(`✓ Fetched ${documents.length} ${documentType} documents in ${sourceLanguage}`);

  return documents;
}

/**
 * Check if a Swedish translation already exists for a document
 * FIXED: Query using baseDocumentId for reliable cross-session detection
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

  // CRITICAL FIX: Resolve all references to Swedish translations
  console.log(`  🔗 Resolving references to Swedish documents...`);
  const resolvedBaseDocument = await resolveAllReferences(baseDocument, targetLanguage);

  // Create the translated document
  // Copy all fields from resolved base document, then override with translations
  const translatedDocument = {
    ...resolvedBaseDocument,
    _id: undefined, // Let Sanity generate new ID
    _rev: undefined, // Don't copy revision
    language: targetLanguage,
    baseDocumentId: baseDocument._id, // CRITICAL: Link back to Norwegian original for cross-session lookups
    ...translatedFields,
  };

  try {
    const result = await client.create(translatedDocument);
    console.log(`  ✓ Created translation ${result._id} for ${baseDocument._id}`);
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
