#!/usr/bin/env ts-node

/**
 * Translate Drawing Images by Subcategory
 *
 * This script translates drawings organized by subcategory, making it easier to:
 * - Track progress per topic (e.g., "Jultomten: 27/30 complete")
 * - Ensure complete coverage of each subcategory
 * - Review related content together
 *
 * Usage:
 *   npm run translate:by-subcategory                    # Translate all subcategories
 *   npm run translate:by-subcategory -- --limit=3       # Process only first 3 subcategories
 *   npm run translate:by-subcategory -- --subcategory="Jultomten"  # Specific subcategory
 */

import * as dotenv from 'dotenv';
import { program } from 'commander';
import { acquireLock, releaseLock } from './process-lock';
import {
  initSanityClient,
  getSanityClient,
  fetchAllTranslatedIds,
  createTranslationDocument,
} from './sanity-client';
import { initOpenAIClient, translateDocument } from './openai-client';
import { TRANSLATION_CONFIG } from './config';
import { validateDocumentTranslation, printValidationSummary } from './glossary-validator';

dotenv.config();

/**
 * Translate a document with retry logic
 */
async function translateWithRetry(
  document: any,
  maxRetries: number = TRANSLATION_CONFIG.MAX_RETRIES
): Promise<Record<string, any>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await translateDocument(document, 'drawingImage');
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw new Error(
          `Translation failed after ${maxRetries} attempts: ${lastError.message}`
        );
      }

      const waitTime = 2000 * attempt;
      console.log(`    ⚠ Attempt ${attempt}/${maxRetries} failed, retrying in ${waitTime / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Translation failed');
}

/**
 * Main translation function
 */
async function translateBySubcategory(options: {
  limit?: number;
  subcategory?: string;
}): Promise<void> {
  console.log('🌐 Translate Drawings by Subcategory\n');
  console.log('='.repeat(70) + '\n');

  // Acquire process lock
  if (!acquireLock()) {
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
    releaseLock();
    process.exit(1);
  }

  const client = getSanityClient();

  // Fetch all Norwegian subcategories (active, published)
  console.log('📊 Fetching Norwegian subcategories...');
  let subcategories = await client.fetch(`
    *[_type == "subcategory" && language == "no" && isActive == true && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  `);

  // Filter by specific subcategory if requested
  if (options.subcategory) {
    subcategories = subcategories.filter((sub: any) =>
      sub.title.toLowerCase().includes(options.subcategory!.toLowerCase())
    );
    if (subcategories.length === 0) {
      console.log(`⚠ No subcategories found matching "${options.subcategory}"\n`);
      releaseLock();
      process.exit(0);
    }
  }

  // Apply limit if specified
  if (options.limit) {
    subcategories = subcategories.slice(0, options.limit);
  }

  console.log(`✓ Found ${subcategories.length} Norwegian subcategories to process\n`);

  // Fetch all Swedish subcategories with their baseDocumentId
  console.log('📊 Fetching Swedish subcategory translations...');
  const swedishSubcategories = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId
    }
  `);

  // Build Norwegian → Swedish subcategory mapping
  const norwegianToSwedish = new Map<string, any>();
  swedishSubcategories.forEach((sv: any) => {
    if (sv.baseDocumentId) {
      norwegianToSwedish.set(sv.baseDocumentId, sv);
    }
  });

  console.log(`✓ Found ${swedishSubcategories.length} Swedish subcategories\n`);

  // Process each subcategory
  let globalSuccess = 0;
  let globalFailed = 0;
  let globalSkipped = 0;
  let completeSubcategories = 0;
  let incompleteSubcategories = 0;

  for (let i = 0; i < subcategories.length; i++) {
    const subcategory = subcategories[i];

    console.log('='.repeat(70));
    console.log(`\n📂 [${i + 1}/${subcategories.length}] ${subcategory.title}`);
    console.log(`   Slug: ${subcategory.slug}\n`);

    // Find Swedish translation of this subcategory
    const swedishSubcategory = norwegianToSwedish.get(subcategory._id);
    if (!swedishSubcategory) {
      console.log('   ⚠️  No Swedish translation found for this subcategory!');
      console.log('   → Translate subcategories first: npm run translate -- --type=subcategory\n');
      continue;
    }

    console.log(`   ✓ Swedish subcategory: "${swedishSubcategory.title}"\n`);

    // MEMORY OPTIMIZATION: Fetch translated IDs for this subcategory only (not all drawings)
    console.log(`   🔍 Checking existing translations for this subcategory...`);
    const translatedDrawingIds = await fetchAllTranslatedIds('drawingImage', 'sv');

    // Fetch all drawings for this Norwegian subcategory
    const drawings = await client.fetch(`
      *[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**")) && subcategory._ref == $subcategoryId] | order(title asc) {
        _id,
        _type,
        _createdAt,
        title,
        slug,
        description,
        metaDescription,
        contextContent,
        downloadFile,
        displayImage,
        thumbnailImage,
        webpImage,
        instagramImage,
        pinterestImage,
        hasDigitalColoring,
        difficulty,
        recommendedAgeRange,
        order,
        publishedDate,
        isActive,
        isPublishedToPinterest,
        isPublishedToInstagram,
        isPublishedToFacebook,
        tags,
        entity,
        seo,
        subcategory,
        language
      }
    `, { subcategoryId: subcategory._id });

    const totalDrawings = drawings.length;
    const untranslatedDrawings = drawings.filter((d: any) => !translatedDrawingIds.has(d._id));
    const alreadyTranslated = totalDrawings - untranslatedDrawings.length;

    console.log(`   📊 Drawings in this subcategory:`);
    console.log(`      Total: ${totalDrawings}`);
    console.log(`      Already translated: ${alreadyTranslated}`);
    console.log(`      Remaining: ${untranslatedDrawings.length}\n`);

    if (untranslatedDrawings.length === 0) {
      console.log(`   ✅ All drawings already translated!\n`);
      completeSubcategories++;
      continue;
    }

    // Translate each drawing
    let successCount = 0;
    let failedCount = 0;

    for (let j = 0; j < untranslatedDrawings.length; j++) {
      const drawing = untranslatedDrawings[j];

      console.log(`   [${j + 1}/${untranslatedDrawings.length}] ${drawing.title}`);

      try {
        // Translate the drawing
        const translatedFields = await translateWithRetry(drawing);

        // Validate glossary
        const glossaryValidation = validateDocumentTranslation(drawing, translatedFields);
        if (glossaryValidation.totalViolations > 0) {
          console.log(`      📖 ${glossaryValidation.totalViolations} glossary warning(s)`);
        }

        // Create translation
        const result = await createTranslationDocument(
          drawing,
          translatedFields,
          'sv',
          false
        );

        if (result) {
          successCount++;
          globalSuccess++;
          console.log(`      ✓ Created`);
        }

        // Batch delay
        if ((j + 1) % TRANSLATION_CONFIG.BATCH_SIZE === 0 && j + 1 < untranslatedDrawings.length) {
          console.log(`\n      ⏸ Batch complete, waiting ${TRANSLATION_CONFIG.DELAY_BETWEEN_BATCHES_MS}ms...\n`);
          await new Promise(resolve => setTimeout(resolve, TRANSLATION_CONFIG.DELAY_BETWEEN_BATCHES_MS));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`      ✗ Failed: ${errorMessage}`);
        failedCount++;
        globalFailed++;
      }
    }

    const newlyTranslated = alreadyTranslated + successCount;
    const percentComplete = ((newlyTranslated / totalDrawings) * 100).toFixed(1);

    console.log(`\n   📊 Subcategory Summary:`);
    console.log(`      ✓ Successful: ${successCount}`);
    console.log(`      ✗ Failed: ${failedCount}`);
    console.log(`      📈 Total translated: ${newlyTranslated}/${totalDrawings} (${percentComplete}%)\n`);

    // Track completion
    if (newlyTranslated === totalDrawings) {
      completeSubcategories++;
    } else {
      incompleteSubcategories++;
    }

    // MEMORY CLEANUP: Clear large objects to help GC
    // @ts-ignore
    translatedDrawingIds.clear();
  }

  // Final Summary
  console.log('='.repeat(70));
  console.log('\n🎯 FINAL SUMMARY\n');
  console.log('='.repeat(70) + '\n');

  console.log(`Processed ${subcategories.length} subcategories\n`);

  // Global stats
  console.log('📊 Session Statistics:\n');
  console.log(`   ✓ Successfully translated: ${globalSuccess}`);
  console.log(`   ✗ Failed: ${globalFailed}`);
  if (globalSkipped > 0) {
    console.log(`   ⊘ Skipped: ${globalSkipped}`);
  }
  console.log();

  const totalProcessed = completeSubcategories + incompleteSubcategories;
  console.log(`   ✅ Complete subcategories: ${completeSubcategories}/${totalProcessed}`);
  console.log(`   ⏳ Incomplete subcategories: ${incompleteSubcategories}/${totalProcessed}\n`);

  console.log('='.repeat(70) + '\n');

  releaseLock();
  console.log('✅ Translation complete!\n');
}

/**
 * CLI Setup
 */
program
  .name('translate-by-subcategory')
  .description('Translate drawing images organized by subcategory')
  .option('-l, --limit <number>', 'Limit number of subcategories to process', parseInt)
  .option('-s, --subcategory <name>', 'Process only subcategories matching this name')
  .action(async (options) => {
    try {
      await translateBySubcategory({
        limit: options.limit,
        subcategory: options.subcategory,
      });
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Translation failed:', error);
      releaseLock();
      process.exit(1);
    }
  });

program.parse();
