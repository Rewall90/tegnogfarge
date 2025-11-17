#!/usr/bin/env ts-node

/**
 * Translate all Kjøretøy subcategories with QA checks
 * Translates one subcategory at a time and runs quality check after each
 */

import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { initSanityClient } from './sanity-client';

dotenv.config();

const KJORETOY_CATEGORY_ID = '44a5ba7d-0800-4adb-899a-26786ffa0532';

async function translateKjoretoyWithQA() {
  console.log('\n🚗 Translate All Kjøretøy Subcategories with QA\n');
  console.log('='.repeat(70) + '\n');

  const client = initSanityClient();

  // Get all subcategories in kjøretøy category
  const subcategories = await client.fetch(
    `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      "norwegianDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]),
      "swedishDrawings": count(*[_type == "drawingImage" && language == "sv" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]._id])
    }`,
    { categoryId: KJORETOY_CATEGORY_ID }
  );

  console.log(`Found ${subcategories.length} subcategories in Kjøretøy:\n`);

  // Show overview
  subcategories.forEach((sub: any, idx: number) => {
    const remaining = sub.norwegianDrawings - sub.swedishDrawings;
    const status = remaining === 0 ? '✅' : '⏳';
    console.log(`${idx + 1}. ${status} ${sub.title}`);
    console.log(`   Norwegian: ${sub.norwegianDrawings}, Swedish: ${sub.swedishDrawings}, Remaining: ${remaining}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');

  // Process each subcategory
  for (let i = 0; i < subcategories.length; i++) {
    const sub = subcategories[i];
    const remaining = sub.norwegianDrawings - sub.swedishDrawings;

    console.log(`\n📂 [${i + 1}/${subcategories.length}] ${sub.title}`);
    console.log(`   Slug: ${sub.slug}`);
    console.log(`   Drawings: ${sub.norwegianDrawings} (${remaining} remaining)\n`);

    if (remaining === 0) {
      console.log('   ✅ Already fully translated, skipping...\n');
      continue;
    }

    // Translate this subcategory
    console.log('   🔄 Starting translation...\n');
    try {
      execSync(
        `npx tsx scripts/translation/translate-by-subcategory.ts --subcategory="${sub.title}"`,
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          timeout: 1800000 // 30 minutes max per subcategory
        }
      );
    } catch (error) {
      console.error(`\n   ❌ Translation failed for ${sub.title}:`, error);
      console.log('   Continuing to next subcategory...\n');
      continue;
    }

    // Run QA check
    console.log('\n   🔍 Running quality check...\n');
    try {
      const qaResult = await runQACheck(sub._id, sub.title);

      console.log(`\n   📊 QA Results for ${sub.title}:`);
      console.log(`      Total: ${qaResult.total}`);
      console.log(`      Translated: ${qaResult.translated}`);
      console.log(`      Complete: ${qaResult.complete}`);
      console.log(`      Has Issues: ${qaResult.hasIssues}`);

      if (qaResult.hasIssues > 0) {
        console.log(`\n      ⚠️  ${qaResult.hasIssues} drawings have missing fields`);
      } else if (qaResult.complete === qaResult.translated) {
        console.log(`\n      ✅ Perfect! All drawings fully translated`);
      }

    } catch (error) {
      console.error(`\n   ❌ QA check failed:`, error);
    }

    console.log('\n' + '='.repeat(70));

    // Small delay between subcategories
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n🎉 All Kjøretøy subcategories processed!\n');
}

async function runQACheck(subcategoryId: string, subcategoryTitle: string) {
  const client = initSanityClient();

  // Get Norwegian drawings count
  const norwegianCount = await client.fetch(
    `count(*[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId])`,
    { subcategoryId }
  );

  // Get Swedish drawings with completeness check
  const swedishDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "sv" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId]._id] {
      _id,
      "hasDisplayImage": defined(displayImage.asset._ref),
      "hasThumbnailImage": defined(thumbnailImage.asset._ref),
      "hasWebpImage": defined(webpImage.asset._ref),
      "hasDifficulty": defined(difficulty),
      "hasRecommendedAge": defined(recommendedAgeRange)
    }`,
    { subcategoryId }
  );

  let complete = 0;
  let hasIssues = 0;

  swedishDrawings.forEach((drawing: any) => {
    const isComplete =
      drawing.hasDisplayImage &&
      drawing.hasThumbnailImage &&
      drawing.hasWebpImage &&
      drawing.hasDifficulty &&
      drawing.hasRecommendedAge;

    if (isComplete) {
      complete++;
    } else {
      hasIssues++;
    }
  });

  return {
    total: norwegianCount,
    translated: swedishDrawings.length,
    complete,
    hasIssues
  };
}

translateKjoretoyWithQA().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
