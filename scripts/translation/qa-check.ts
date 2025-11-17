/**
 * Quality Control Check for Swedish Translations
 * Verifies:
 * 1. All active Norwegian subcategories have exactly 1 Swedish translation
 * 2. No duplicates in Swedish
 * 3. No orphaned Swedish translations
 * 4. baseDocumentId linkage is correct
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

interface QAReport {
  norwegianTotal: number;
  norwegianActivePublished: number;
  swedishTotal: number;

  fullyTranslated: Array<{ noId: string; title: string; svId: string }>;
  missing: Array<{ noId: string; title: string }>;
  duplicates: Array<{ noId: string; title: string; svIds: string[] }>;
  orphaned: Array<{ svId: string; title: string; baseId: string | null }>;

  errors: string[];
}

async function runQACheck() {
  const client = getSanityClient();

  console.log('\n🔍 QUALITY CONTROL CHECK - Swedish Subcategory Translations\n');
  console.log('='.repeat(70) + '\n');

  const report: QAReport = {
    norwegianTotal: 0,
    norwegianActivePublished: 0,
    swedishTotal: 0,
    fullyTranslated: [],
    missing: [],
    duplicates: [],
    orphaned: [],
    errors: [],
  };

  // Step 1: Fetch all Norwegian subcategories (active, published only)
  console.log('📊 Step 1: Fetching Norwegian subcategories...');
  const norwegianDocs = await client.fetch(`
    *[_type == "subcategory" && language == "no" && isActive == true && !(_id in path("drafts.**"))]{
      _id,
      title,
      "slug": slug.current
    } | order(title asc)
  `);

  const norwegianAll = await client.fetch(`count(*[_type == "subcategory" && language == "no"])`);

  report.norwegianActivePublished = norwegianDocs.length;
  report.norwegianTotal = norwegianAll;

  console.log(`   ✓ Found ${report.norwegianActivePublished} active published Norwegian subcategories`);
  console.log(`   ℹ Total Norwegian (including drafts/inactive): ${report.norwegianTotal}\n`);

  // Step 2: Fetch all Swedish subcategories
  console.log('📊 Step 2: Fetching Swedish subcategories...');
  const swedishDocs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId,
      "slug": slug.current
    } | order(title asc)
  `);

  report.swedishTotal = swedishDocs.length;
  console.log(`   ✓ Found ${report.swedishTotal} Swedish subcategories\n`);

  // Step 3: Create mapping of Norwegian ID → Swedish translations
  console.log('📊 Step 3: Analyzing translation coverage...');
  const norwegianToSwedish = new Map<string, any[]>();

  swedishDocs.forEach((sv: any) => {
    if (!sv.baseDocumentId) {
      report.orphaned.push({
        svId: sv._id,
        title: sv.title,
        baseId: null,
      });
      return;
    }

    if (!norwegianToSwedish.has(sv.baseDocumentId)) {
      norwegianToSwedish.set(sv.baseDocumentId, []);
    }
    norwegianToSwedish.get(sv.baseDocumentId)!.push(sv);
  });

  // Step 4: Check each Norwegian document
  for (const noDocs of norwegianDocs) {
    const swedishTranslations = norwegianToSwedish.get(noDocs._id) || [];

    if (swedishTranslations.length === 0) {
      // Missing translation
      report.missing.push({
        noId: noDocs._id,
        title: noDocs.title,
      });
    } else if (swedishTranslations.length === 1) {
      // Perfect - exactly 1 translation
      report.fullyTranslated.push({
        noId: noDocs._id,
        title: noDocs.title,
        svId: swedishTranslations[0]._id,
      });
    } else {
      // Duplicate translations!
      report.duplicates.push({
        noId: noDocs._id,
        title: noDocs.title,
        svIds: swedishTranslations.map(sv => sv._id),
      });
    }
  }

  // Step 5: Check for orphaned Swedish translations (point to inactive/draft/deleted Norwegian)
  console.log('📊 Step 4: Checking for orphaned Swedish translations...');
  const norwegianIds = new Set(norwegianDocs.map((d: any) => d._id));

  swedishDocs.forEach((sv: any) => {
    if (sv.baseDocumentId && !norwegianIds.has(sv.baseDocumentId)) {
      report.orphaned.push({
        svId: sv._id,
        title: sv.title,
        baseId: sv.baseDocumentId,
      });
    }
  });

  console.log('   ✓ Analysis complete\n');

  // Print Report
  console.log('='.repeat(70));
  console.log('\n📋 QUALITY CONTROL REPORT\n');
  console.log('='.repeat(70) + '\n');

  // Overview
  console.log('📊 OVERVIEW:');
  console.log(`   Norwegian (active, published): ${report.norwegianActivePublished}`);
  console.log(`   Swedish translations:          ${report.swedishTotal}`);
  console.log(`   Coverage:                      ${((report.fullyTranslated.length / report.norwegianActivePublished) * 100).toFixed(1)}%\n`);

  // Fully Translated
  if (report.fullyTranslated.length > 0) {
    console.log(`✅ FULLY TRANSLATED: ${report.fullyTranslated.length} subcategories`);
    console.log(`   All have exactly 1 Swedish translation\n`);
  }

  // Missing Translations
  if (report.missing.length > 0) {
    console.log(`❌ MISSING TRANSLATIONS: ${report.missing.length} subcategories`);
    report.missing.forEach((item, i) => {
      console.log(`   ${i + 1}. "${item.title}"`);
      console.log(`      Norwegian ID: ${item.noId}`);
    });
    console.log();
  } else {
    console.log('✅ NO MISSING TRANSLATIONS\n');
  }

  // Duplicates
  if (report.duplicates.length > 0) {
    console.log(`❌ DUPLICATES FOUND: ${report.duplicates.length} Norwegian subcategories have multiple Swedish translations`);
    report.duplicates.forEach((item, i) => {
      console.log(`   ${i + 1}. "${item.title}" (${item.svIds.length} Swedish copies)`);
      console.log(`      Norwegian ID: ${item.noId}`);
      console.log(`      Swedish IDs: ${item.svIds.join(', ')}`);
    });
    console.log();
  } else {
    console.log('✅ NO DUPLICATES\n');
  }

  // Orphaned
  if (report.orphaned.length > 0) {
    console.log(`⚠️  ORPHANED SWEDISH TRANSLATIONS: ${report.orphaned.length}`);
    console.log('   These Swedish translations point to inactive/draft/deleted Norwegian documents:');
    report.orphaned.forEach((item, i) => {
      console.log(`   ${i + 1}. "${item.title}"`);
      console.log(`      Swedish ID: ${item.svId}`);
      console.log(`      Points to: ${item.baseId || 'null (no baseDocumentId)'}`);
    });
    console.log();
  } else {
    console.log('✅ NO ORPHANED TRANSLATIONS\n');
  }

  // Final Verdict
  console.log('='.repeat(70));
  console.log('\n🎯 FINAL VERDICT:\n');

  const isClean =
    report.missing.length === 0 &&
    report.duplicates.length === 0 &&
    report.orphaned.length === 0;

  if (isClean) {
    console.log('✅ ✅ ✅  ALL CHECKS PASSED! ✅ ✅ ✅\n');
    console.log(`   • ${report.fullyTranslated.length}/${report.norwegianActivePublished} Norwegian subcategories translated (100%)`);
    console.log('   • No duplicates');
    console.log('   • No orphaned translations');
    console.log('   • All baseDocumentId linkages correct\n');
    console.log('🎉 The Swedish translation is complete and error-free!\n');
  } else {
    console.log('⚠️  ISSUES FOUND:\n');

    if (report.missing.length > 0) {
      console.log(`   ❌ ${report.missing.length} missing translation(s)`);
    }
    if (report.duplicates.length > 0) {
      console.log(`   ❌ ${report.duplicates.length} duplicate(s) - ${report.duplicates.reduce((sum, d) => sum + d.svIds.length - 1, 0)} extra Swedish documents`);
    }
    if (report.orphaned.length > 0) {
      console.log(`   ⚠️  ${report.orphaned.length} orphaned Swedish translation(s)`);
    }

    console.log('\n💡 RECOMMENDATIONS:\n');

    if (report.missing.length > 0) {
      console.log('   → Run: npm run translate:subcategories');
      console.log('      To translate missing subcategories\n');
    }
    if (report.duplicates.length > 0) {
      console.log('   → Run: npx tsx scripts/translation/delete-duplicates.ts');
      console.log('      To clean up duplicate Swedish translations\n');
    }
    if (report.orphaned.length > 0) {
      console.log('   → Manually delete orphaned Swedish translations in Sanity Studio');
      console.log('      Or activate/publish the corresponding Norwegian documents\n');
    }
  }

  console.log('='.repeat(70) + '\n');

  // Return exit code
  process.exit(isClean ? 0 : 1);
}

runQACheck();
