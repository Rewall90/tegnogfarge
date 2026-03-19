#!/usr/bin/env node

/**
 * Investigate how flag drawings were translated without a Swedish subcategory
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

async function investigateFlagTranslations() {
  const subcategoryId = '384b514f-afb7-48fd-b0df-a4bab192065b';

  console.log('=== INVESTIGATING FLAG TRANSLATION MYSTERY ===\n');

  // Get all Norwegian drawings in this subcategory
  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**")) && subcategory._ref == $subcategoryId] | order(title asc) {
      _id,
      title
    }
  `, { subcategoryId });

  console.log(`📊 Norwegian drawings in "Fargelegge Flagg": ${norwegianDrawings.length}\n`);

  // Get Swedish translations and check their subcategory references
  const swedishTranslations = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && baseDocumentId in $norwegianIds] {
      _id,
      title,
      baseDocumentId,
      subcategory,
      "subcategoryInfo": subcategory->{
        _id,
        title,
        language
      }
    }
  `, { norwegianIds: norwegianDrawings.map(d => d._id) });

  console.log(`✓ Swedish translations found: ${swedishTranslations.length}\n`);

  // Analyze subcategory references
  const subcategoryMap = new Map();
  const noSubcategory = [];

  swedishTranslations.forEach(t => {
    if (!t.subcategoryInfo) {
      noSubcategory.push(t);
    } else {
      const key = `${t.subcategoryInfo.title} (${t.subcategoryInfo._id})`;
      if (!subcategoryMap.has(key)) {
        subcategoryMap.set(key, []);
      }
      subcategoryMap.get(key).push(t);
    }
  });

  console.log('🔍 Subcategory Analysis:\n');

  if (noSubcategory.length > 0) {
    console.log(`❌ Translations with NO subcategory: ${noSubcategory.length}`);
    console.log('   Examples:');
    noSubcategory.slice(0, 5).forEach(t => {
      console.log(`   - ${t.title}`);
    });
    console.log();
  }

  if (subcategoryMap.size > 0) {
    console.log(`📁 Translations grouped by Swedish subcategory:\n`);
    for (const [key, drawings] of subcategoryMap.entries()) {
      console.log(`   ${key}: ${drawings.length} drawings`);
      if (drawings.length <= 3) {
        drawings.forEach(d => {
          console.log(`      - ${d.title}`);
        });
      }
    }
    console.log();
  }

  // Check if there's a Swedish subcategory that references the Norwegian one
  console.log('🔎 Checking for Swedish subcategory with baseDocumentId...\n');
  const swedishSubcategory = await client.fetch(`
    *[_type == "subcategory" && language == "sv" && baseDocumentId == $subcategoryId] {
      _id,
      title,
      baseDocumentId,
      "slug": slug.current
    }
  `, { subcategoryId });

  if (swedishSubcategory.length > 0) {
    console.log('✓ Found Swedish subcategory:');
    swedishSubcategory.forEach(s => {
      console.log(`   ID: ${s._id}`);
      console.log(`   Title: ${s.title}`);
      console.log(`   Slug: ${s.slug}`);
      console.log(`   baseDocumentId: ${s.baseDocumentId}`);
    });
  } else {
    console.log('❌ No Swedish subcategory found with baseDocumentId matching Norwegian subcategory');
  }
}

investigateFlagTranslations().catch(console.error);
