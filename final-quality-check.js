const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

(async () => {
  console.log('🔍 FINAL Quality Check: Tegneserier Translation to German\n');
  console.log('='.repeat(70));

  // Get the category
  const category = await client.fetch(`*[_type == "category" && language == "no" && title == "Tegneserier"][0]{ _id, title }`);
  const germanCategory = await client.fetch(`*[_type == "category" && language == "de" && baseDocumentId == $categoryId][0]{ _id, title }`, { categoryId: category._id });

  console.log(`\n📂 Category: ${category.title}`);
  console.log(`   Norwegian: ${category.title} (${category._id})`);
  console.log(`   German: ${germanCategory ? germanCategory.title + ' ✅' : '❌ NOT TRANSLATED'}`);

  // Get all subcategories with their German translations
  const subcategories = await client.fetch(
    `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(isActive desc, title asc) {
      _id,
      title,
      isActive
    }`,
    { categoryId: category._id }
  );

  console.log('\n='.repeat(70));
  console.log('\n📊 DETAILED SUBCATEGORY STATUS:\n');

  let activeCount = 0;
  let inactiveCount = 0;
  let fullyTranslatedActive = 0;
  let totalActiveDrawings = 0;
  let totalGermanDrawings = 0;
  let skippedInactiveCorrectly = 0;

  for (const sub of subcategories) {
    // Check if German subcategory exists
    const germanSub = await client.fetch(
      `*[_type == "subcategory" && language == "de" && baseDocumentId == $subId][0]{ _id, title }`,
      { subId: sub._id }
    );

    // Count Norwegian drawings
    const noDrawingCount = await client.fetch(
      `count(*[_type == "drawingImage" && language == "no" && subcategory._ref == $subId])`,
      { subId: sub._id }
    );

    // Count German drawings (if German subcategory exists)
    let deDrawingCount = 0;
    if (germanSub) {
      deDrawingCount = await client.fetch(
        `count(*[_type == "drawingImage" && language == "de" && subcategory._ref == $deSubId])`,
        { deSubId: germanSub._id }
      );
    }

    const status = sub.isActive ? '✓ ACTIVE' : '✗ INACTIVE';
    const complete = noDrawingCount === deDrawingCount && noDrawingCount > 0;

    let translationStatus = '';
    if (sub.isActive) {
      activeCount++;
      totalActiveDrawings += noDrawingCount;
      totalGermanDrawings += deDrawingCount;

      if (complete) {
        translationStatus = '✅ FULLY TRANSLATED';
        fullyTranslatedActive++;
      } else if (deDrawingCount > 0) {
        translationStatus = `⚠️  PARTIALLY TRANSLATED (${deDrawingCount}/${noDrawingCount})`;
      } else {
        translationStatus = '❌ NOT TRANSLATED';
      }
    } else {
      inactiveCount++;
      if (germanSub || deDrawingCount > 0) {
        translationStatus = `⚠️  INCORRECTLY TRANSLATED`;
      } else {
        translationStatus = '✅ CORRECTLY SKIPPED';
        skippedInactiveCorrectly++;
      }
    }

    console.log(`${status.padEnd(12)} | ${sub.title.padEnd(40)} | ${translationStatus}`);
    if (germanSub) {
      console.log(`              German: ${germanSub.title}`);
    }
    console.log(`              Drawings: NO: ${noDrawingCount}, DE: ${deDrawingCount}`);
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n📊 FINAL SUMMARY:\n');
  console.log(`Total Subcategories: ${subcategories.length}`);
  console.log(`  Active: ${activeCount}`);
  console.log(`  Inactive: ${inactiveCount}\n`);

  console.log('Active Subcategories Translation Status:');
  console.log(`  ✅ Fully Translated: ${fullyTranslatedActive}/${activeCount}`);
  console.log(`  ⚠️  Partially Translated: ${activeCount - fullyTranslatedActive}/${activeCount}`);
  console.log(`  Success Rate: ${((fullyTranslatedActive / activeCount) * 100).toFixed(1)}%\n`);

  console.log('Inactive Subcategories Check:');
  console.log(`  ✅ Correctly Skipped: ${skippedInactiveCorrectly}/${inactiveCount}`);
  console.log(`  ⚠️  Incorrectly Translated: ${inactiveCount - skippedInactiveCorrectly}/${inactiveCount}\n`);

  console.log('Drawings Translation:');
  console.log(`  Norwegian (Active only): ${totalActiveDrawings}`);
  console.log(`  German: ${totalGermanDrawings}`);
  console.log(`  Completion: ${((totalGermanDrawings / totalActiveDrawings) * 100).toFixed(1)}%\n`);

  console.log('='.repeat(70));

  if (fullyTranslatedActive === activeCount && skippedInactiveCorrectly === inactiveCount && totalGermanDrawings === totalActiveDrawings) {
    console.log('\n✅ ✅ ✅ QUALITY CHECK PASSED! ✅ ✅ ✅\n');
    console.log('   ✓ Category translated to German');
    console.log(`   ✓ All ${activeCount} active subcategories fully translated`);
    console.log(`   ✓ All ${inactiveCount} inactive subcategories correctly skipped`);
    console.log(`   ✓ All ${totalActiveDrawings} drawings translated to German\n`);
    console.log('   🎉 Translation complete and verified!\n');
  } else {
    console.log('\n⚠️  QUALITY CHECK ISSUES:\n');
    if (fullyTranslatedActive < activeCount) {
      console.log(`   • ${activeCount - fullyTranslatedActive} active subcategories not fully translated`);
    }
    if (skippedInactiveCorrectly < inactiveCount) {
      console.log(`   • ${inactiveCount - skippedInactiveCorrectly} inactive subcategories were incorrectly translated`);
    }
    if (totalGermanDrawings < totalActiveDrawings) {
      console.log(`   • ${totalActiveDrawings - totalGermanDrawings} drawings missing`);
    }
    console.log('');
  }

  console.log('='.repeat(70));
})();
