#!/usr/bin/env ts-node

/**
 * Translation Script
 * Translates Norwegian content to Swedish using OpenAI GPT-4
 *
 * Usage:
 *   npm run translate                    # Translate all document types
 *   npm run translate -- --type=category # Translate only categories
 *   npm run translate -- --dry-run       # Preview without creating documents
 *   npm run translate -- --limit=5       # Translate only first 5 documents
 *
 * Required environment variables:
 *   SANITY_WRITE_TOKEN - Sanity API token with write permissions
 *   OPENAI_API_KEY - OpenAI API key
 */

import * as dotenv from 'dotenv';
import { program } from 'commander';
import { TRANSLATION_CONFIG } from './config';
import { acquireLock, releaseLock } from './process-lock';
import {
  initSanityClient,
  fetchSourceDocuments,
  translationExists,
  fetchAllTranslatedIds,
  createTranslationDocument,
  getTranslationStats,
} from './sanity-client';
import { initOpenAIClient, translateDocument } from './openai-client';
import type { DocumentType, TranslationStats, TranslationResult } from './types';
import {
  initProgressTracker,
  loadProgress,
  saveProgress,
  recordSuccess,
  recordFailure,
  recordSkipped,
  recordGlossaryWarning,
  isDocumentCompleted,
  clearProgress,
  archiveProgress,
  printProgressSummary,
  checkPartialTranslation,
  shouldResume,
  type TranslationProgress,
} from './progress-tracker';
import { clearReferenceCache, validateReferences, addReferenceMapping } from './reference-resolver';
import { validateDocumentTranslation, printValidationSummary } from './glossary-validator';

// Load environment variables
dotenv.config();

/**
 * Translate a document with retry logic
 * Handles transient failures like rate limits and network errors
 */
async function translateWithRetry(
  document: any,
  docType: DocumentType,
  maxRetries: number = TRANSLATION_CONFIG.MAX_RETRIES
): Promise<Record<string, any>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await translateDocument(document, docType);
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        // Last attempt failed, throw error
        throw new Error(
          `Translation failed after ${maxRetries} attempts: ${lastError.message}`
        );
      }

      // Exponential backoff: 2s, 4s, 6s...
      const waitTime = 2000 * attempt;
      console.log(
        `  ⚠ Attempt ${attempt}/${maxRetries} failed, retrying in ${waitTime / 1000}s...`
      );
      console.log(`  Error: ${lastError.message}`);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Translation failed');
}

/**
 * Main translation function
 */
async function translateDocuments(options: {
  documentType?: DocumentType;
  dryRun: boolean;
  limit?: number;
}): Promise<void> {
  console.log('🌐 Translation Script Starting...\n');

  // Acquire process lock to prevent concurrent runs
  if (!options.dryRun && !acquireLock()) {
    console.error('Exiting to prevent duplicate translations.\n');
    process.exit(1);
  }

  // Initialize clients
  try {
    initSanityClient();
    initOpenAIClient();
    console.log('✓ Clients initialized\n');
  } catch (error) {
    console.error('✗ Failed to initialize clients:', error);
    if (!options.dryRun) releaseLock();
    process.exit(1);
  }

  // Determine which document types to process
  const documentTypes = options.documentType
    ? [options.documentType]
    : TRANSLATION_CONFIG.DOCUMENT_TYPES;

  console.log(`Document types to process: ${documentTypes.join(', ')}`);
  console.log(`Mode: ${options.dryRun ? 'DRY RUN (no changes)' : 'LIVE (will create documents)'}`);
  if (options.limit) {
    console.log(`Limit: First ${options.limit} documents per type`);
  }
  console.log('\n' + '='.repeat(60) + '\n');

  // Process each document type
  for (const docType of documentTypes) {
    console.log(`\n📄 Processing ${docType.toUpperCase()}...`);

    // Clear reference cache to reload mappings from progress file
    clearReferenceCache();

    // Check for partial translations (warning!)
    const partialCheck = await checkPartialTranslation(
      () => require('./sanity-client').getSanityClient(),
      docType,
      'sv'
    );

    if (partialCheck.hasPartial) {
      console.log(partialCheck.message);
      if (!options.dryRun && !shouldResume()) {
        console.log('⊘ Skipping this document type');
        continue;
      }
    }

    // Show current stats
    const stats = await getTranslationStats(docType);
    console.log(`\nCurrent state:`);
    console.log(`  Norwegian documents: ${stats.norwegian}`);
    console.log(`  Swedish documents: ${stats.swedish}`);
    console.log(`  Missing translations: ${stats.missing}\n`);

    if (stats.missing === 0) {
      console.log(`✓ All ${docType} documents already translated!\n`);
      continue;
    }

    // Fetch source documents
    const sourceDocuments = await fetchSourceDocuments(docType, 'no');

    if (sourceDocuments.length === 0) {
      console.log(`⚠ No ${docType} documents found\n`);
      continue;
    }

    // Apply limit if specified
    const documentsToProcess = options.limit
      ? sourceDocuments.slice(0, options.limit)
      : sourceDocuments;

    console.log(`Processing ${documentsToProcess.length} documents...\n`);

    // OPTIMIZATION: Fetch all translated IDs once (bulk query)
    console.log('🚀 Fetching existing translations (bulk query)...');
    const translatedIds = await fetchAllTranslatedIds(docType, 'sv');
    console.log();

    // Initialize or load progress tracker
    let progress: TranslationProgress;
    const existingProgress = loadProgress();

    if (
      existingProgress &&
      existingProgress.documentType === docType &&
      !options.dryRun
    ) {
      console.log('📂 Found existing progress, resuming...');
      progress = existingProgress;
      console.log(`  Previously completed: ${progress.stats.success}`);
      console.log(`  Previously failed: ${progress.stats.failed}\n`);
    } else {
      if (!options.dryRun) {
        clearProgress();
      }
      progress = initProgressTracker(docType, 'sv');
      progress.stats.total = documentsToProcess.length;
    }

    // Translation stats (kept for compatibility)
    const translationStats: TranslationStats = {
      total: documentsToProcess.length,
      success: 0,
      failed: 0,
      skipped: 0,
      startTime: new Date(),
    };

    // Reference validation tracking for dry-run
    const referenceIssues: Array<{
      documentTitle: string;
      missingReferences: Array<{
        fieldName: string;
        norwegianId: string;
        referenceType: string;
      }>;
    }> = [];

    // Process documents in batches
    for (let i = 0; i < documentsToProcess.length; i++) {
      const document = documentsToProcess[i];

      console.log(`\n[${i + 1}/${documentsToProcess.length}] ${document.title}`);

      // Skip if already completed in this session
      if (isDocumentCompleted(progress, document._id)) {
        console.log('  ✓ Already completed in this session, skipping');
        translationStats.skipped++;
        continue;
      }

      try {
        // OPTIMIZED: Check if translation already exists using in-memory Set (O(1) lookup)
        if (translatedIds.has(document._id)) {
          console.log('  ⊘ Translation already exists, skipping');
          translationStats.skipped++;
          recordSkipped(progress);
          continue;
        }

        // Validate references in dry-run mode
        if (options.dryRun) {
          console.log('  🔍 Validating references...');
          const validation = await validateReferences(document, docType, 'sv');

          if (!validation.valid) {
            console.log('  ⚠️  Warning: Missing reference translations:');
            for (const missing of validation.missingReferences) {
              console.log(`    - ${missing.fieldName} (${missing.referenceType}): ${missing.norwegianId}`);
              console.log(`      → Swedish ${missing.referenceType} must be translated first`);
            }

            // Track for summary
            referenceIssues.push({
              documentTitle: document.title,
              missingReferences: validation.missingReferences,
            });
          } else {
            console.log('  ✓ All references valid');
          }
        }

        // Translate document with retry logic
        const translatedFields = await translateWithRetry(document, docType);

        // Validate glossary compliance
        console.log('  📖 Validating glossary compliance...');
        const glossaryValidation = validateDocumentTranslation(document, translatedFields);
        printValidationSummary(document.title, glossaryValidation);

        // Create translation document
        const result = await createTranslationDocument(
          document,
          translatedFields,
          'sv',
          options.dryRun
        );

        translationStats.success++;

        // Record success in progress tracker
        if (!options.dryRun && result) {
          // Update reference cache with new mapping (for future subcategory/drawing translations)
          addReferenceMapping(document._id, result._id);

          recordSuccess(
            progress,
            document._id,
            result._id,
            document.title,
            glossaryValidation.totalViolations
          );

          // Record glossary warnings if any violations found
          if (glossaryValidation.totalViolations > 0) {
            const violations = [];
            for (const [fieldName, fieldResult] of Object.entries(glossaryValidation.fieldResults)) {
              for (const violation of fieldResult.violations) {
                violations.push({
                  fieldName,
                  norwegianTerm: violation.norwegianTerm,
                  expectedSwedish: violation.expectedSwedish,
                });
              }
            }
            recordGlossaryWarning(progress, document._id, document.title, violations);
          }
        }

        // Batch delay to avoid rate limits
        if ((i + 1) % TRANSLATION_CONFIG.BATCH_SIZE === 0) {
          console.log(`\n  ⏸ Batch complete, waiting ${TRANSLATION_CONFIG.DELAY_BETWEEN_BATCHES_MS}ms...\n`);
          await new Promise(resolve =>
            setTimeout(resolve, TRANSLATION_CONFIG.DELAY_BETWEEN_BATCHES_MS)
          );
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ Failed to translate document:`, errorMessage);
        translationStats.failed++;

        // Extract detailed error information
        const errorType = error instanceof Error ? error.constructor.name : 'Unknown';
        const stack = error instanceof Error ? error.stack : undefined;

        // Try to extract field name from error message
        let fieldName: string | undefined;
        if (errorMessage.includes('title')) fieldName = 'title';
        else if (errorMessage.includes('description')) fieldName = 'description';
        else if (errorMessage.includes('contextContent')) fieldName = 'contextContent';
        else if (errorMessage.includes('slug')) fieldName = 'slug';
        else if (errorMessage.includes('parentCategory')) fieldName = 'parentCategory';
        else if (errorMessage.includes('subcategory')) fieldName = 'subcategory';

        // Record failure in progress tracker with detailed error info
        if (!options.dryRun) {
          recordFailure(
            progress,
            document._id,
            document.title,
            errorMessage,
            3,
            {
              fieldName,
              errorType,
              stack
            }
          );
        }
      }
    }

    // Archive progress and print summary
    if (!options.dryRun) {
      archiveProgress();
      printProgressSummary(progress);
    }

    // Print final stats for this document type
    translationStats.endTime = new Date();
    const duration = translationStats.endTime.getTime() - translationStats.startTime.getTime();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n📊 ${docType.toUpperCase()} Translation Complete:`);
    console.log(`  ✓ Success: ${translationStats.success}`);
    console.log(`  ⊘ Skipped: ${translationStats.skipped}`);
    console.log(`  ✗ Failed: ${translationStats.failed}`);
    console.log(`  ⏱ Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`\n${'='.repeat(60)}\n`);

    // Display reference validation summary for dry-run
    if (options.dryRun && referenceIssues.length > 0) {
      console.log(`⚠️  Reference Validation Issues (${referenceIssues.length} documents):\n`);

      // Group by reference type
      const byReferenceType = new Map<string, number>();
      for (const issue of referenceIssues) {
        for (const ref of issue.missingReferences) {
          const count = byReferenceType.get(ref.referenceType) || 0;
          byReferenceType.set(ref.referenceType, count + 1);
        }
      }

      console.log('Summary:');
      for (const [refType, count] of byReferenceType.entries()) {
        console.log(`  - Missing ${refType} translations: ${count}`);
      }

      console.log('\nRecommendation:');
      if (docType === 'subcategory') {
        console.log('  ⚡ Translate categories first: npm run translate -- --type=category');
      } else if (docType === 'drawingImage') {
        console.log('  ⚡ Translate subcategories first: npm run translate -- --type=subcategory');
      }
      console.log('  Then retry this translation.\n');

      console.log(`${'='.repeat(60)}\n`);
    } else if (options.dryRun && referenceIssues.length === 0) {
      console.log('✅ All reference validations passed!\n');
      console.log(`${'='.repeat(60)}\n`);
    }

    // Clear progress if all succeeded
    if (!options.dryRun && translationStats.failed === 0) {
      clearProgress();
      console.log('✓ All translations successful, progress cleared\n');
    } else if (!options.dryRun && translationStats.failed > 0) {
      console.log(`⚠️  ${translationStats.failed} documents failed`);
      console.log('💡 Re-run the script to retry failed documents\n');
    }
  }

  console.log('\n✅ Translation script complete!\n');

  if (options.dryRun) {
    console.log('💡 This was a dry run. Run without --dry-run to create translations.\n');
  } else {
    console.log('💡 Translations created! Verify in Sanity Studio before publishing.\n');
  }
}

/**
 * CLI Setup
 */
program
  .name('translate')
  .description('Translate Norwegian content to Swedish')
  .option('-t, --type <type>', 'Document type to translate (category|subcategory|drawingImage)')
  .option('-d, --dry-run', 'Preview translations without creating documents', false)
  .option('-l, --limit <number>', 'Limit number of documents to process', parseInt)
  .action(async (options) => {
    try {
      await translateDocuments({
        documentType: options.type as DocumentType | undefined,
        dryRun: options.dryRun,
        limit: options.limit,
      });
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Translation failed:', error);
      process.exit(1);
    }
  });

program.parse();
