#!/usr/bin/env ts-node

/**
 * Quality Check for Traktor Translations
 * Verifies all drawings were translated and all fields are present
 */

import * as dotenv from 'dotenv';
import { initSanityClient } from './sanity-client';

dotenv.config();

async function qaTraktorTranslations() {
  const client = initSanityClient();

  console.log('\n🔍 Quality Check: Traktor Translations\n');
  console.log('='.repeat(70) + '\n');

  // Find traktor subcategory
  const traktorSubcategory = await client.fetch(
    `*[_type == "subcategory" && slug.current match "fargelegg-traktor*" && language == "no"][0] {
      _id,
      title
    }`
  );

  if (!traktorSubcategory) {
    console.error('❌ Could not find Norwegian traktor subcategory');
    process.exit(1);
  }

  console.log(`📂 Checking subcategory: ${traktorSubcategory.title}\n`);

  // Get all Norwegian traktor drawings
  const norwegianDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId] | order(title asc) {
      _id,
      title,
      "hasDisplayImage": defined(displayImage.asset._ref),
      "hasThumbnailImage": defined(thumbnailImage.asset._ref),
      "hasWebpImage": defined(webpImage.asset._ref),
      "hasDownloadFile": defined(downloadFile.asset._ref),
      "hasDifficulty": defined(difficulty),
      "hasRecommendedAge": defined(recommendedAgeRange),
      "hasDigitalColoring": defined(hasDigitalColoring)
    }`,
    { subcategoryId: traktorSubcategory._id }
  );

  // Get all Swedish traktor drawings
  const swedishDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "sv" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId]._id] | order(title asc) {
      _id,
      title,
      baseDocumentId,
      "slug": slug.current,
      "hasDisplayImage": defined(displayImage.asset._ref),
      "hasThumbnailImage": defined(thumbnailImage.asset._ref),
      "hasWebpImage": defined(webpImage.asset._ref),
      "hasDownloadFile": defined(downloadFile.asset._ref),
      "hasDifficulty": defined(difficulty),
      "hasRecommendedAge": defined(recommendedAgeRange),
      "hasDigitalColoring": defined(hasDigitalColoring),
      displayImage,
      thumbnailImage,
      webpImage,
      downloadFile,
      difficulty,
      recommendedAgeRange,
      hasDigitalColoring
    }`,
    { subcategoryId: traktorSubcategory._id }
  );

  console.log(`📊 Translation Coverage:`);
  console.log(`   Norwegian drawings: ${norwegianDrawings.length}`);
  console.log(`   Swedish drawings: ${swedishDrawings.length}`);
  console.log(`   Missing: ${norwegianDrawings.length - swedishDrawings.length}\n`);

  if (norwegianDrawings.length !== swedishDrawings.length) {
    console.log('⚠️  WARNING: Not all drawings have been translated!\n');
  } else {
    console.log('✅ All drawings have been translated!\n');
  }

  // Check each Swedish drawing for completeness
  console.log('='.repeat(70));
  console.log('\n🔍 Checking Individual Translations:\n');

  let fullyComplete = 0;
  let hasIssues = 0;
  const issues: any[] = [];

  for (let i = 0; i < swedishDrawings.length; i++) {
    const swedish = swedishDrawings[i];
    console.log(`\n[${i + 1}/${swedishDrawings.length}] ${swedish.title}`);
    console.log(`   ID: ${swedish._id}`);
    console.log(`   Slug: ${swedish.slug}`);
    console.log(`   Base: ${swedish.baseDocumentId}`);

    const missingFields: string[] = [];

    // Check required image fields
    if (!swedish.hasDisplayImage) missingFields.push('displayImage');
    if (!swedish.hasThumbnailImage) missingFields.push('thumbnailImage');
    if (!swedish.hasWebpImage) missingFields.push('webpImage');

    // Check metadata fields
    if (!swedish.hasDifficulty) missingFields.push('difficulty');
    if (!swedish.hasRecommendedAge) missingFields.push('recommendedAgeRange');
    if (swedish.hasDigitalColoring === undefined) missingFields.push('hasDigitalColoring');

    // Check alt texts (should be translated, not empty)
    if (swedish.displayImage?.alt && swedish.displayImage.alt.trim() === '') {
      missingFields.push('displayImage.alt (empty)');
    }
    if (swedish.thumbnailImage?.alt && swedish.thumbnailImage.alt.trim() === '') {
      missingFields.push('thumbnailImage.alt (empty)');
    }
    if (swedish.webpImage?.alt && swedish.webpImage.alt.trim() === '') {
      missingFields.push('webpImage.alt (empty)');
    }

    if (missingFields.length === 0) {
      console.log('   ✅ Complete - all fields present');
      fullyComplete++;
    } else {
      console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
      hasIssues++;
      issues.push({
        title: swedish.title,
        id: swedish._id,
        missing: missingFields
      });
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 QUALITY CHECK SUMMARY\n');
  console.log('='.repeat(70) + '\n');

  console.log(`Total Drawings:`);
  console.log(`   Norwegian: ${norwegianDrawings.length}`);
  console.log(`   Swedish: ${swedishDrawings.length}`);
  console.log(`   Translation rate: ${((swedishDrawings.length / norwegianDrawings.length) * 100).toFixed(1)}%\n`);

  console.log(`Quality Status:`);
  console.log(`   ✅ Fully complete: ${fullyComplete}`);
  console.log(`   ⚠️  Has issues: ${hasIssues}\n`);

  if (issues.length > 0) {
    console.log('⚠️  Drawings with Issues:\n');
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. "${issue.title}" (${issue.id})`);
      console.log(`   Missing: ${issue.missing.join(', ')}\n`);
    });
  }

  if (hasIssues === 0 && norwegianDrawings.length === swedishDrawings.length) {
    console.log('🎉 PERFECT! All traktor drawings have been correctly translated with all fields!\n');
  } else if (hasIssues > 0) {
    console.log('⚠️  Some drawings are missing fields and may need to be re-translated.\n');
  } else {
    console.log('⚠️  Some drawings have not been translated yet.\n');
  }

  console.log('='.repeat(70) + '\n');
}

qaTraktorTranslations().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
