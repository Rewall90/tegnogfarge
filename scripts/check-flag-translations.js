#!/usr/bin/env node

/**
 * Check translation status for "Fargelegge Flagg" subcategory
 */

const sanityClient = require('@sanity/client');
require('dotenv').config();

const client = sanityClient.default({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function checkFlagTranslations() {
  const subcategoryId = '384b514f-afb7-48fd-b0df-a4bab192065b';

  console.log('=== FARGELEGGE FLAGG TRANSLATION STATUS ===\n');

  // Get all Norwegian drawings in this subcategory
  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**")) && subcategory._ref == $subcategoryId] | order(title asc) {
      _id,
      title
    }
  `, { subcategoryId });

  console.log(`📊 Norwegian drawings: ${norwegianDrawings.length}\n`);

  // Get all Swedish translations
  const swedishTranslations = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && baseDocumentId in $norwegianIds] {
      _id,
      title,
      baseDocumentId
    }
  `, { norwegianIds: norwegianDrawings.map(d => d._id) });

  console.log(`✓ Already translated to Swedish: ${swedishTranslations.length}`);
  console.log(`⏳ Remaining to translate: ${norwegianDrawings.length - swedishTranslations.length}\n`);

  const percentage = ((swedishTranslations.length / norwegianDrawings.length) * 100).toFixed(1);
  console.log(`📈 Progress: ${percentage}%\n`);

  // Show which ones are missing if there are not too many
  if (norwegianDrawings.length - swedishTranslations.length <= 20 && norwegianDrawings.length - swedishTranslations.length > 0) {
    const translatedIds = new Set(swedishTranslations.map(t => t.baseDocumentId));
    const untranslated = norwegianDrawings.filter(d => !translatedIds.has(d._id));

    console.log('📝 Untranslated drawings:');
    untranslated.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.title}`);
    });
  }
}

checkFlagTranslations().catch(console.error);
