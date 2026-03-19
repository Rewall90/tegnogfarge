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
  console.log('🔍 COMPLETE TRANSLATION SCAN - All Categories\n');
  console.log('='.repeat(80));

  // Get all Norwegian categories
  const categories = await client.fetch(
    `*[_type == "category" && language == "no" && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title
    }`
  );

  console.log(`\nFound ${categories.length} Norwegian categories\n`);
  console.log('='.repeat(80));

  let totalCategories = 0;
  let translatedCategories = 0;
  let totalSubcategories = 0;
  let activeSubcategories = 0;
  let inactiveSubcategories = 0;
  let fullyTranslatedSubcategories = 0;
  let partiallyTranslatedSubcategories = 0;
  let untranslatedSubcategories = 0;
  let totalActiveDrawings = 0;
  let totalGermanDrawings = 0;

  const categoryDetails = [];

  for (const category of categories) {
    totalCategories++;

    // Check if category is translated
    const germanCategory = await client.fetch(
      `*[_type == "category" && language == "de" && baseDocumentId == $categoryId][0]{ _id, title }`,
      { categoryId: category._id }
    );

    if (germanCategory) translatedCategories++;

    // Get subcategories
    const subcategories = await client.fetch(
      `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(isActive desc, title asc) {
        _id,
        title,
        isActive
      }`,
      { categoryId: category._id }
    );

    totalSubcategories += subcategories.length;

    let categoryActiveCount = 0;
    let categoryInactiveCount = 0;
    let categoryFullyTranslated = 0;
    let categoryPartiallyTranslated = 0;
    let categoryUntranslated = 0;
    let categoryActiveDrawings = 0;
    let categoryGermanDrawings = 0;

    for (const sub of subcategories) {
      if (sub.isActive) {
        categoryActiveCount++;
        activeSubcategories++;

        // Check if German subcategory exists
        const germanSub = await client.fetch(
          `*[_type == "subcategory" && language == "de" && baseDocumentId == $subId][0]{ _id }`,
          { subId: sub._id }
        );

        // Count drawings
        const noDrawingCount = await client.fetch(
          `count(*[_type == "drawingImage" && language == "no" && subcategory._ref == $subId])`,
          { subId: sub._id }
        );

        let deDrawingCount = 0;
        if (germanSub) {
          deDrawingCount = await client.fetch(
            `count(*[_type == "drawingImage" && language == "de" && subcategory._ref == $deSubId])`,
            { deSubId: germanSub._id }
          );
        }

        categoryActiveDrawings += noDrawingCount;
        categoryGermanDrawings += deDrawingCount;

        if (noDrawingCount === deDrawingCount && noDrawingCount > 0) {
          categoryFullyTranslated++;
          fullyTranslatedSubcategories++;
        } else if (deDrawingCount > 0) {
          categoryPartiallyTranslated++;
          partiallyTranslatedSubcategories++;
        } else {
          categoryUntranslated++;
          untranslatedSubcategories++;
        }
      } else {
        categoryInactiveCount++;
        inactiveSubcategories++;
      }
    }

    totalActiveDrawings += categoryActiveDrawings;
    totalGermanDrawings += categoryGermanDrawings;

    const completion = categoryActiveDrawings > 0
      ? ((categoryGermanDrawings / categoryActiveDrawings) * 100).toFixed(1)
      : 0;

    categoryDetails.push({
      name: category.title,
      german: germanCategory ? germanCategory.title : null,
      categoryTranslated: !!germanCategory,
      totalSubs: subcategories.length,
      activeSubs: categoryActiveCount,
      inactiveSubs: categoryInactiveCount,
      fullyTranslated: categoryFullyTranslated,
      partiallyTranslated: categoryPartiallyTranslated,
      untranslated: categoryUntranslated,
      noDrawings: categoryActiveDrawings,
      deDrawings: categoryGermanDrawings,
      completion: completion
    });
  }

  // Print detailed results
  console.log('\n📊 CATEGORY DETAILS:\n');

  categoryDetails.forEach((cat, i) => {
    const status = cat.completion == 100 ? '✅' : cat.completion > 0 ? '⚠️ ' : '❌';

    console.log(`${(i + 1).toString().padStart(2)}. ${status} ${cat.name.padEnd(30)} → ${cat.german || '❌ NOT TRANSLATED'}`);
    console.log(`    Subcategories: ${cat.totalSubs} total (${cat.activeSubs} active, ${cat.inactiveSubs} inactive)`);
    console.log(`    Translation: ✅ ${cat.fullyTranslated} | ⚠️  ${cat.partiallyTranslated} | ❌ ${cat.untranslated}`);
    console.log(`    Drawings: ${cat.deDrawings}/${cat.noDrawings} (${cat.completion}%)`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('\n📊 OVERALL SUMMARY:\n');

  console.log('Categories:');
  console.log(`  Total: ${totalCategories}`);
  console.log(`  Translated: ${translatedCategories}/${totalCategories} (${((translatedCategories/totalCategories)*100).toFixed(1)}%)\n`);

  console.log('Subcategories:');
  console.log(`  Total: ${totalSubcategories}`);
  console.log(`  Active: ${activeSubcategories}`);
  console.log(`  Inactive: ${inactiveSubcategories}\n`);

  console.log('Active Subcategories Translation Status:');
  console.log(`  ✅ Fully Translated: ${fullyTranslatedSubcategories}/${activeSubcategories} (${((fullyTranslatedSubcategories/activeSubcategories)*100).toFixed(1)}%)`);
  console.log(`  ⚠️  Partially Translated: ${partiallyTranslatedSubcategories}/${activeSubcategories} (${((partiallyTranslatedSubcategories/activeSubcategories)*100).toFixed(1)}%)`);
  console.log(`  ❌ Not Translated: ${untranslatedSubcategories}/${activeSubcategories} (${((untranslatedSubcategories/activeSubcategories)*100).toFixed(1)}%)\n`);

  console.log('Drawings (Active subcategories only):');
  console.log(`  Norwegian: ${totalActiveDrawings}`);
  console.log(`  German: ${totalGermanDrawings}`);
  console.log(`  Remaining: ${totalActiveDrawings - totalGermanDrawings}`);
  console.log(`  Completion: ${((totalGermanDrawings/totalActiveDrawings)*100).toFixed(1)}%\n`);

  console.log('='.repeat(80));

  // Show categories that need work
  const needsWork = categoryDetails.filter(cat => cat.completion < 100 && cat.activeSubs > 0);

  if (needsWork.length > 0) {
    console.log('\n⚠️  CATEGORIES NEEDING TRANSLATION:\n');
    needsWork.forEach(cat => {
      const remaining = cat.noDrawings - cat.deDrawings;
      console.log(`  • ${cat.name} (${cat.completion}% complete, ${remaining} drawings remaining)`);
    });
    console.log('');
  }

  const completed = categoryDetails.filter(cat => cat.completion == 100 && cat.activeSubs > 0);
  if (completed.length > 0) {
    console.log(`\n✅ FULLY TRANSLATED CATEGORIES: ${completed.length}\n`);
    completed.forEach(cat => {
      console.log(`  ✓ ${cat.name} (${cat.noDrawings} drawings)`);
    });
    console.log('');
  }

  console.log('='.repeat(80));
})();
