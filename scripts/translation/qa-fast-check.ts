#!/usr/bin/env ts-node

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function fastQACheck() {
  console.log('🔍 FAST QUALITY ASSURANCE CHECK\n');
  console.log('='.repeat(80));
  console.log('\nChecking translation coverage and field completeness...\n');

  // 1. Check translation coverage
  console.log('📊 Step 1: Checking translation coverage...\n');

  const norwegianDrawings = await client.fetch(`
    count(*[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**"))])
  `);

  const swedishDrawings = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && isActive == true && !(_id in path("drafts.**"))])
  `);

  console.log(`Norwegian drawings: ${norwegianDrawings}`);
  console.log(`Swedish drawings: ${swedishDrawings}`);
  console.log(`Coverage: ${((swedishDrawings / norwegianDrawings) * 100).toFixed(2)}%\n`);

  // 2. Check for missing translations
  console.log('📊 Step 2: Checking for missing translations...\n');

  const norwegianIds = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**"))]{
      _id
    }
  `);

  const swedishBaseIds = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**"))]{
      baseDocumentId
    }
  `);

  const swedishBaseIdSet = new Set(swedishBaseIds.map((d: any) => d.baseDocumentId));
  const missingTranslations = norwegianIds.filter((d: any) => !swedishBaseIdSet.has(d._id));

  if (missingTranslations.length > 0) {
    console.log(`🔴 Found ${missingTranslations.length} Norwegian drawings without Swedish translation:\n`);

    for (const missing of missingTranslations.slice(0, 20)) {
      const doc = await client.fetch(`
        *[_id == $id][0]{
          title,
          "category": *[_type == "category" && _id == ^.subcategory->parentCategory._ref][0].title,
          "subcategory": subcategory->title
        }
      `, { id: missing._id });

      console.log(`  • ${doc.category} > ${doc.subcategory} > "${doc.title}"`);
      console.log(`    ID: ${missing._id}`);
    }

    if (missingTranslations.length > 20) {
      console.log(`\n  ... and ${missingTranslations.length - 20} more`);
    }
  } else {
    console.log('✅ All Norwegian drawings have Swedish translations!\n');
  }

  // 3. Check for empty required fields
  console.log('\n📊 Step 3: Checking for empty required fields in Swedish translations...\n');

  const emptyTitles = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**")) && (title == null || title == "")])
  `);

  const emptyDescriptions = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**")) && (description == null || description == "")])
  `);

  const emptyMetaDescriptions = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**")) && (metaDescription == null || metaDescription == "")])
  `);

  const emptySlugs = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**")) && slug.current == null])
  `);

  console.log(`Empty titles: ${emptyTitles}`);
  console.log(`Empty descriptions: ${emptyDescriptions}`);
  console.log(`Empty meta descriptions: ${emptyMetaDescriptions}`);
  console.log(`Missing slugs: ${emptySlugs}\n`);

  // Get sample of empty fields if any exist
  if (emptyTitles > 0) {
    console.log('🔴 Sample drawings with empty titles:\n');
    const samples = await client.fetch(`
      *[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**")) && (title == null || title == "")][0...5]{
        _id,
        baseDocumentId,
        "norwegianTitle": *[_id == ^.baseDocumentId][0].title
      }
    `);
    samples.forEach((s: any) => console.log(`  • Norwegian: "${s.norwegianTitle}" (Swedish ID: ${s._id})`));
    console.log('');
  }

  if (emptyDescriptions > 0) {
    console.log('🔴 Sample drawings with empty descriptions:\n');
    const samples = await client.fetch(`
      *[_type == "drawingImage" && language == "sv" && !(_id in path("drafts.**")) && (description == null || description == "")][0...5]{
        _id,
        title,
        baseDocumentId
      }
    `);
    samples.forEach((s: any) => console.log(`  • "${s.title}" (ID: ${s._id})`));
    console.log('');
  }

  // 4. Check categories and subcategories
  console.log('📊 Step 4: Checking categories and subcategories...\n');

  const norwegianCategories = await client.fetch(`
    count(*[_type == "category" && language == "no" && isActive == true])
  `);

  const swedishCategories = await client.fetch(`
    count(*[_type == "category" && language == "sv" && isActive == true])
  `);

  const norwegianSubcategories = await client.fetch(`
    count(*[_type == "subcategory" && language == "no" && isActive == true])
  `);

  const swedishSubcategories = await client.fetch(`
    count(*[_type == "subcategory" && language == "sv" && isActive == true])
  `);

  console.log(`Norwegian categories: ${norwegianCategories}`);
  console.log(`Swedish categories: ${swedishCategories}`);
  console.log(`Norwegian subcategories: ${norwegianSubcategories}`);
  console.log(`Swedish subcategories: ${swedishSubcategories}\n`);

  // Final Summary
  console.log('='.repeat(80));
  console.log('\n🎯 FINAL QA SUMMARY\n');

  const totalIssues = missingTranslations.length + emptyTitles + emptyDescriptions + emptyMetaDescriptions + emptySlugs;

  if (totalIssues === 0 &&
      norwegianDrawings === swedishDrawings &&
      norwegianCategories === swedishCategories &&
      norwegianSubcategories === swedishSubcategories) {
    console.log('✅ ✅ ✅ PERFECT! EVERYTHING IS TRANSLATED CORRECTLY! ✅ ✅ ✅\n');
    console.log('✓ All drawings are translated');
    console.log('✓ All required fields are filled');
    console.log('✓ All categories and subcategories match\n');
  } else {
    console.log(`⚠️  Found ${totalIssues} total issues:\n`);
    if (missingTranslations.length > 0) console.log(`  • ${missingTranslations.length} missing translations`);
    if (emptyTitles > 0) console.log(`  • ${emptyTitles} empty titles`);
    if (emptyDescriptions > 0) console.log(`  • ${emptyDescriptions} empty descriptions`);
    if (emptyMetaDescriptions > 0) console.log(`  • ${emptyMetaDescriptions} empty meta descriptions`);
    if (emptySlugs > 0) console.log(`  • ${emptySlugs} missing slugs`);
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('\n✅ QA Check Complete!\n');
}

fastQACheck().catch(console.error);
