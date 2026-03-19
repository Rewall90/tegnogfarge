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
  console.log('🔍 Checking Category: Feiringer (or similar)\n');
  console.log('='.repeat(70));

  // First, find the category (try partial match)
  const categories = await client.fetch(`*[_type == "category" && language == "no" && title match "*eiring*"]{ _id, title }`);

  if (categories.length === 0) {
    console.log('❌ No category found matching "Feiringer" or "Feiring"\n');
    console.log('Let me list all Norwegian categories:');
    const allCategories = await client.fetch(`*[_type == "category" && language == "no"] | order(title asc) { _id, title }`);
    allCategories.forEach(cat => console.log(`  - ${cat.title}`));
    return;
  }

  if (categories.length > 1) {
    console.log('Multiple matching categories found:');
    categories.forEach(cat => console.log(`  - ${cat.title}`));
    console.log('\nUsing first match...\n');
  }

  const category = categories[0];
  console.log(`\n📂 Category: ${category.title} (${category._id})\n`);

  // Check German translation
  const germanCategory = await client.fetch(
    `*[_type == "category" && language == "de" && baseDocumentId == $categoryId][0]{ _id, title }`,
    { categoryId: category._id }
  );

  console.log('Category Translation:');
  console.log(`  Norwegian: ${category.title}`);
  console.log(`  German: ${germanCategory ? germanCategory.title + ' ✅' : '❌ NOT TRANSLATED'}`);

  // Get all subcategories
  const subcategories = await client.fetch(
    `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(isActive desc, title asc) {
      _id,
      title,
      isActive
    }`,
    { categoryId: category._id }
  );

  console.log('\n='.repeat(70));
  console.log(`\n📊 SUBCATEGORIES (${subcategories.length} total):\n`);

  let activeCount = 0;
  let inactiveCount = 0;
  let totalActiveDrawings = 0;
  let totalGermanDrawings = 0;
  let fullyTranslatedActive = 0;

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
        translationStatus = `⚠️  PARTIALLY (${deDrawingCount}/${noDrawingCount})`;
      } else {
        translationStatus = '❌ NOT TRANSLATED';
      }
    } else {
      inactiveCount++;
      if (germanSub || deDrawingCount > 0) {
        translationStatus = `⚠️  INCORRECTLY TRANSLATED (${deDrawingCount} drawings)`;
      } else {
        translationStatus = '✅ SKIPPED';
      }
    }

    console.log(`${status.padEnd(12)} | ${sub.title.padEnd(35)} | ${translationStatus}`);
    if (germanSub) {
      console.log(`              DE: ${germanSub.title}`);
    }
    console.log(`              Drawings: NO: ${noDrawingCount}, DE: ${deDrawingCount}`);
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`Total Subcategories: ${subcategories.length}`);
  console.log(`  ✓ Active: ${activeCount}`);
  console.log(`  ✗ Inactive: ${inactiveCount}\n`);

  if (activeCount > 0) {
    console.log('Active Subcategories Status:');
    console.log(`  ✅ Fully Translated: ${fullyTranslatedActive}/${activeCount}`);
    console.log(`  ⚠️  Incomplete: ${activeCount - fullyTranslatedActive}/${activeCount}`);
    console.log(`  Success Rate: ${((fullyTranslatedActive / activeCount) * 100).toFixed(1)}%\n`);

    console.log('Drawings (Active subcategories only):');
    console.log(`  Norwegian: ${totalActiveDrawings}`);
    console.log(`  German: ${totalGermanDrawings}`);
    console.log(`  Remaining: ${totalActiveDrawings - totalGermanDrawings}`);
    console.log(`  Completion: ${((totalGermanDrawings / totalActiveDrawings) * 100).toFixed(1)}%\n`);

    if (totalGermanDrawings === totalActiveDrawings && fullyTranslatedActive === activeCount) {
      console.log('✅ Translation is COMPLETE!\n');
    } else {
      console.log('⚠️  Translation is INCOMPLETE\n');
      console.log('To translate this category, run:');
      console.log(`  rm -f .translation-lock && npx tsx scripts/translation/translate-category.ts --category="${category.title}" --target=de\n`);
    }
  }

  console.log('='.repeat(70));
})();
