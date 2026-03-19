#!/usr/bin/env ts-node

/**
 * Translate a Complete Category with All Subcategories and Drawings
 *
 * This script translates an entire category hierarchy:
 * 1. Translates the category itself (if not already translated)
 * 2. Translates all subcategories under that category
 * 3. Translates all drawings in each subcategory
 * 4. Runs QA checks after each subcategory
 *
 * Usage:
 *   npx tsx scripts/translation/translate-category.ts --category="Feiring" --target=de
 *   npx tsx scripts/translation/translate-category.ts --category="Høytider" --target=sv
 *   npx tsx scripts/translation/translate-category.ts --category="Dyr" --target=de --dry-run
 */

import * as dotenv from 'dotenv';
import { program } from 'commander';
import { execSync } from 'child_process';
import { initSanityClient, getSanityClient } from './sanity-client';
import type { TargetLanguage } from './config';

dotenv.config();

interface SubcategoryInfo {
  _id: string;
  title: string;
  slug: string;
  norwegianDrawings: number;
  translatedDrawings: number;
}

async function translateCategory(options: {
  category: string;
  target: TargetLanguage;
  dryRun: boolean;
}): Promise<void> {
  const { category, target, dryRun } = options;
  const targetLanguageName = target === 'de' ? 'German' : 'Swedish';

  console.log(`\n🌐 Translate Complete Category: ${category}`);
  console.log(`   Target language: ${targetLanguageName} (${target})`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);
  console.log('='.repeat(70) + '\n');

  const client = initSanityClient();

  // Step 1: Find the Norwegian category by title (case-insensitive partial match)
  console.log(`📂 Step 1: Finding category "${category}"...\n`);

  const norwegianCategory = await client.fetch(
    `*[_type == "category" && language == "no" && title match $searchTerm][0]{
      _id,
      title,
      "slug": slug.current
    }`,
    { searchTerm: `*${category}*` }
  );

  if (!norwegianCategory) {
    console.error(`❌ No Norwegian category found matching "${category}"\n`);
    process.exit(1);
  }

  console.log(`   ✓ Found Norwegian category: "${norwegianCategory.title}" (${norwegianCategory._id})\n`);

  // Step 2: Check if category translation exists
  console.log(`📂 Step 2: Checking if category is already translated...\n`);

  const translatedCategory = await client.fetch(
    `*[_type == "category" && language == $targetLanguage && baseDocumentId == $baseId][0]{
      _id,
      title
    }`,
    { targetLanguage: target, baseId: norwegianCategory._id }
  );

  if (translatedCategory) {
    console.log(`   ✓ Category already translated: "${translatedCategory.title}"\n`);
  } else {
    console.log(`   ⚠️  Category not yet translated to ${targetLanguageName}\n`);
    console.log(`   🔄 Translating category "${norwegianCategory.title}"...\n`);

    if (!dryRun) {
      try {
        execSync(
          `npm run translate -- --type=category --target=${target} --name="${norwegianCategory.title}"`,
          {
            cwd: process.cwd(),
            stdio: 'inherit',
            timeout: 120000 // 2 minutes
          }
        );
        console.log(`\n   ✅ Category translation complete!\n`);
      } catch (error) {
        console.error(`\n   ❌ Failed to translate category:`, error);
        process.exit(1);
      }
    } else {
      console.log(`   [DRY RUN] Would translate category here\n`);
    }
  }

  // Step 3: Get all subcategories under this category
  console.log(`📂 Step 3: Finding subcategories under "${norwegianCategory.title}"...\n`);

  const subcategories: SubcategoryInfo[] = await client.fetch(
    `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && isActive == true && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      "norwegianDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]),
      "translatedDrawings": count(*[_type == "drawingImage" && language == $targetLanguage && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]._id])
    }`,
    { categoryId: norwegianCategory._id, targetLanguage: target }
  );

  if (subcategories.length === 0) {
    console.log(`   ⚠️  No subcategories found under "${norwegianCategory.title}"\n`);
    console.log(`   ℹ️  This category might only contain direct drawings (not common)\n`);
    return;
  }

  console.log(`   ✓ Found ${subcategories.length} subcategories:\n`);

  let totalDrawings = 0;
  let totalTranslatedDrawings = 0;

  subcategories.forEach((sub, i) => {
    const remaining = sub.norwegianDrawings - sub.translatedDrawings;
    const status = remaining === 0 ? '✅' : '⏳';
    console.log(`   ${i + 1}. ${status} ${sub.title}`);
    console.log(`      Norwegian: ${sub.norwegianDrawings}, ${targetLanguageName}: ${sub.translatedDrawings}, Remaining: ${remaining}`);
    totalDrawings += sub.norwegianDrawings;
    totalTranslatedDrawings += sub.translatedDrawings;
  });

  console.log(`\n   📊 Total drawings: ${totalDrawings}`);
  console.log(`   📊 Already translated: ${totalTranslatedDrawings}`);
  console.log(`   📊 Remaining: ${totalDrawings - totalTranslatedDrawings}\n`);

  if (totalDrawings === totalTranslatedDrawings) {
    console.log(`   ✅ All drawings already translated!\n`);
    return;
  }

  console.log('='.repeat(70) + '\n');

  // Step 4: Translate subcategories (if not already translated)
  console.log(`📂 Step 4: Checking subcategory translations...\n`);

  const translatedSubcategories = await client.fetch(
    `*[_type == "subcategory" && language == $targetLanguage && baseDocumentId in $subcategoryIds]{
      baseDocumentId
    }`,
    { targetLanguage: target, subcategoryIds: subcategories.map(s => s._id) }
  );

  const translatedSubcategoryIds = new Set(translatedSubcategories.map((s: any) => s.baseDocumentId));
  const untranslatedSubcategories = subcategories.filter(s => !translatedSubcategoryIds.has(s._id));

  if (untranslatedSubcategories.length > 0) {
    console.log(`   ⚠️  ${untranslatedSubcategories.length} subcategories not yet translated:\n`);
    untranslatedSubcategories.forEach(sub => {
      console.log(`      - ${sub.title}`);
    });

    console.log(`\n   🔄 Translating ${untranslatedSubcategories.length} subcategories...\n`);

    if (!dryRun) {
      try {
        // Translate each subcategory individually by name
        for (const sub of untranslatedSubcategories) {
          console.log(`      🔄 Translating subcategory: ${sub.title}...`);
          execSync(
            `npm run translate -- --type=subcategory --target=${target} --name="${sub.title}"`,
            {
              cwd: process.cwd(),
              stdio: 'inherit',
              timeout: 120000 // 2 minutes per subcategory
            }
          );
        }
        console.log(`\n   ✅ Subcategory translations complete!\n`);
      } catch (error) {
        console.error(`\n   ❌ Failed to translate subcategories:`, error);
        console.log(`   ℹ️  You can continue anyway - drawings translation will skip untranslated subcategories\n`);
      }
    } else {
      console.log(`   [DRY RUN] Would translate ${untranslatedSubcategories.length} subcategories here\n`);
    }
  } else {
    console.log(`   ✅ All subcategories already translated!\n`);
  }

  console.log('='.repeat(70) + '\n');

  // Step 5: Translate drawings for each subcategory
  console.log(`📂 Step 5: Translating drawings in each subcategory...\n`);

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (let i = 0; i < subcategories.length; i++) {
    const sub = subcategories[i];
    const remaining = sub.norwegianDrawings - sub.translatedDrawings;

    console.log('='.repeat(70));
    console.log(`\n📂 [${i + 1}/${subcategories.length}] ${sub.title}`);
    console.log(`   Slug: ${sub.slug}`);
    console.log(`   Drawings: ${sub.norwegianDrawings} (${remaining} remaining)\n`);

    if (remaining === 0) {
      console.log('   ✅ Already fully translated, skipping...\n');
      totalSkipped += sub.norwegianDrawings;
      continue;
    }

    // Translate this subcategory's drawings
    console.log('   🔄 Starting translation...\n');

    if (!dryRun) {
      try {
        execSync(
          `npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="${sub.title}" --target=${target} --category="${norwegianCategory.title}"`,
          {
            cwd: process.cwd(),
            stdio: 'inherit',
            timeout: 1800000 // 30 minutes max per subcategory
          }
        );

        totalSuccess += remaining;
        console.log(`\n   ✅ Subcategory "${sub.title}" complete!\n`);
      } catch (error) {
        console.error(`\n   ❌ Translation failed for ${sub.title}:`, error);
        console.log('   Continuing to next subcategory...\n');
        totalFailed += remaining;
        continue;
      }
    } else {
      console.log(`   [DRY RUN] Would translate ${remaining} drawings here\n`);
      totalSuccess += remaining;
    }

    // Small delay between subcategories
    if (i < subcategories.length - 1) {
      console.log('   ⏸  Pausing 2 seconds before next subcategory...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final Summary
  console.log('='.repeat(70));
  console.log('\n🎉 CATEGORY TRANSLATION COMPLETE!\n');
  console.log('='.repeat(70) + '\n');

  console.log(`Category: ${norwegianCategory.title}`);
  console.log(`Target language: ${targetLanguageName} (${target})\n`);

  console.log(`📊 Statistics:\n`);
  console.log(`   Subcategories: ${subcategories.length}`);
  console.log(`   Total drawings: ${totalDrawings}`);
  if (!dryRun) {
    console.log(`   ✓ Successfully translated: ${totalSuccess}`);
    console.log(`   ⊘ Already translated (skipped): ${totalSkipped}`);
    console.log(`   ✗ Failed: ${totalFailed}\n`);
  } else {
    console.log(`   [DRY RUN] Would translate: ${totalSuccess}\n`);
  }

  console.log('='.repeat(70) + '\n');

  if (!dryRun && totalFailed > 0) {
    console.log(`⚠️  ${totalFailed} drawings failed. Re-run the script to retry.\n`);
  } else if (!dryRun) {
    console.log(`✅ All translations successful!\n`);
  } else {
    console.log(`💡 This was a dry run. Remove --dry-run to perform actual translations.\n`);
  }
}

/**
 * CLI Setup
 */
program
  .name('translate-category')
  .description('Translate a complete category with all its subcategories and drawings')
  .requiredOption('-c, --category <name>', 'Category name (partial match, e.g., "Feiring", "Høytider")')
  .option('--target <language>', 'Target language (sv|de)', 'sv')
  .option('-d, --dry-run', 'Preview what would be translated without making changes', false)
  .action(async (options) => {
    // Validate target language
    if (!['sv', 'de'].includes(options.target)) {
      console.error(`\n✗ Invalid target language: ${options.target}`);
      console.error('  Supported languages: sv (Swedish), de (German)\n');
      process.exit(1);
    }

    try {
      await translateCategory({
        category: options.category,
        target: options.target as TargetLanguage,
        dryRun: options.dryRun,
      });
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Translation failed:', error);
      process.exit(1);
    }
  });

program.parse();
