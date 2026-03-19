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
  console.log('🔍 Quality Check: Tegneserier Translation to German\n');
  console.log('='.repeat(70));

  // Get the Norwegian category
  const category = await client.fetch(`*[_type == "category" && language == "no" && title == "Tegneserier"][0]{ _id, title }`);

  if (!category) {
    console.log('❌ Category not found');
    return;
  }

  console.log(`\n📂 Category: ${category.title}`);

  // Check if German category exists
  const germanCategory = await client.fetch(
    `*[_type == "category" && language == "de" && baseDocumentId == $categoryId][0]{ _id, title }`,
    { categoryId: category._id }
  );

  console.log(`   Norwegian: ${category.title} (${category._id})`);
  console.log(`   German: ${germanCategory ? germanCategory.title + ' ✅' : '❌ NOT TRANSLATED'}`);

  // Get all subcategories
  const subcategories = await client.fetch(
    `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(isActive desc, title asc) {
      _id,
      title,
      isActive,
      "norwegianDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]),
      "germanDrawings": count(*[_type == "drawingImage" && language == "de" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]._id])
    }`,
    { categoryId: category._id }
  );

  console.log('\n='.repeat(70));
  console.log('\n📊 SUBCATEGORIES STATUS:\n');

  let activeCount = 0;
  let inactiveCount = 0;
  let fullyTranslatedActive = 0;
  let partiallyTranslatedActive = 0;
  let untranslatedActive = 0;
  let totalActiveDrawings = 0;
  let totalGermanDrawings = 0;
  let incorrectlyTranslatedInactive = 0;

  for (const sub of subcategories) {
    const status = sub.isActive ? '✓ ACTIVE' : '✗ INACTIVE';
    const complete = sub.norwegianDrawings === sub.germanDrawings;
    const partial = sub.germanDrawings > 0 && sub.germanDrawings < sub.norwegianDrawings;
    const none = sub.germanDrawings === 0;

    // Check if German subcategory exists
    const germanSub = await client.fetch(
      `*[_type == "subcategory" && language == "de" && baseDocumentId == $subId][0]{ _id, title }`,
      { subId: sub._id }
    );

    let translationStatus = '';
    if (sub.isActive) {
      activeCount++;
      totalActiveDrawings += sub.norwegianDrawings;
      totalGermanDrawings += sub.germanDrawings;

      if (complete) {
        translationStatus = '✅ FULLY TRANSLATED';
        fullyTranslatedActive++;
      } else if (partial) {
        translationStatus = `⚠️  PARTIALLY TRANSLATED (${sub.germanDrawings}/${sub.norwegianDrawings})`;
        partiallyTranslatedActive++;
      } else {
        translationStatus = '❌ NOT TRANSLATED';
        untranslatedActive++;
      }
    } else {
      inactiveCount++;
      if (sub.germanDrawings > 0 || germanSub) {
        translationStatus = `⚠️  INCORRECTLY TRANSLATED (${sub.germanDrawings} drawings)`;
        incorrectlyTranslatedInactive++;
      } else {
        translationStatus = '✅ CORRECTLY SKIPPED';
      }
    }

    console.log(`${status.padEnd(12)} | ${sub.title.padEnd(40)} | ${translationStatus}`);
    if (germanSub && sub.isActive) {
      console.log(`              Subcategory: ${germanSub.title}`);
    }
    console.log(`              Drawings: NO: ${sub.norwegianDrawings}, DE: ${sub.germanDrawings}`);
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`Total Subcategories: ${subcategories.length}`);
  console.log(`  Active: ${activeCount}`);
  console.log(`  Inactive: ${inactiveCount}\n`);

  console.log('Active Subcategories Translation Status:');
  console.log(`  ✅ Fully Translated: ${fullyTranslatedActive}/${activeCount}`);
  console.log(`  ⚠️  Partially Translated: ${partiallyTranslatedActive}/${activeCount}`);
  console.log(`  ❌ Not Translated: ${untranslatedActive}/${activeCount}\n`);

  console.log('Inactive Subcategories Check:');
  console.log(`  ✅ Correctly Skipped: ${inactiveCount - incorrectlyTranslatedInactive}/${inactiveCount}`);
  console.log(`  ⚠️  Incorrectly Translated: ${incorrectlyTranslatedInactive}/${inactiveCount}\n`);

  console.log('Drawings Count:');
  console.log(`  Norwegian (Active only): ${totalActiveDrawings}`);
  console.log(`  German: ${totalGermanDrawings}`);
  console.log(`  Completion: ${((totalGermanDrawings / totalActiveDrawings) * 100).toFixed(1)}%\n`);

  console.log('='.repeat(70));

  if (fullyTranslatedActive === activeCount && incorrectlyTranslatedInactive === 0) {
    console.log('\n✅ QUALITY CHECK PASSED!\n');
    console.log('   • All active subcategories fully translated');
    console.log('   • All inactive subcategories correctly skipped');
    console.log('   • All drawings translated\n');
  } else {
    console.log('\n⚠️  QUALITY CHECK ISSUES FOUND:\n');
    if (fullyTranslatedActive < activeCount) {
      console.log(`   • ${activeCount - fullyTranslatedActive} active subcategories not fully translated`);
    }
    if (incorrectlyTranslatedInactive > 0) {
      console.log(`   • ${incorrectlyTranslatedInactive} inactive subcategories were incorrectly translated`);
    }
    console.log('');
  }

  console.log('='.repeat(70));
})();
