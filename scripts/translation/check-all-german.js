const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkAllGermanDrawings() {
  console.log('\n📊 COMPLETE GERMAN TRANSLATION STATUS - ALL CATEGORIES\n');
  console.log('═'.repeat(80) + '\n');

  // Get total count of German drawings
  const totalGermanDrawings = await client.fetch(
    'count(*[_type == "drawingImage" && language == "de"])'
  );

  console.log(`Total German drawings in database: ${totalGermanDrawings}\n`);

  // Get all categories with their stats
  const categories = await client.fetch(`
    *[_type == "category" && language == "no"] | order(title asc) {
      _id,
      title,
      "hasGermanTranslation": count(*[_type == "category" && language == "de" && baseDocumentId == ^._id]) > 0
    }
  `);

  console.log('CATEGORIES:\n');
  console.log('─'.repeat(80));

  let totalNoDrawings = 0;
  let totalDeDrawings = 0;
  let totalNoSubcats = 0;
  let totalDeSubcats = 0;

  for (const [i, cat] of categories.entries()) {
    // Get subcategory counts
    const noSubcats = await client.fetch(
      `count(*[_type == "subcategory" && language == "no" && parentCategory._ref == $catId])`,
      { catId: cat._id }
    );

    const deSubcats = await client.fetch(
      `count(*[_type == "subcategory" && language == "de" && baseDocumentId in *[_type == "subcategory" && language == "no" && parentCategory._ref == $catId]._id])`,
      { catId: cat._id }
    );

    // Get drawing counts
    const noDrawings = await client.fetch(
      `count(*[_type == "drawingImage" && language == "no" && subcategory._ref in *[_type == "subcategory" && language == "no" && parentCategory._ref == $catId]._id])`,
      { catId: cat._id }
    );

    const deDrawings = await client.fetch(
      `count(*[_type == "drawingImage" && language == "de" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref in *[_type == "subcategory" && language == "no" && parentCategory._ref == $catId]._id]._id])`,
      { catId: cat._id }
    );

    const catStatus = cat.hasGermanTranslation ? '✅' : '❌';
    const subcatProgress = `${deSubcats}/${noSubcats}`;
    const drawingProgress = `${deDrawings}/${noDrawings}`;
    const drawingPercent = noDrawings > 0 ? ((deDrawings / noDrawings) * 100).toFixed(0) : '0';

    console.log(`${i+1}. ${catStatus} ${cat.title}`);
    console.log(`   Category: ${cat.hasGermanTranslation ? 'Translated' : 'NOT translated'}`);
    console.log(`   Subcategories: ${subcatProgress}`);
    console.log(`   Drawings: ${drawingProgress} (${drawingPercent}%)`);

    totalNoDrawings += noDrawings;
    totalDeDrawings += deDrawings;
    totalNoSubcats += noSubcats;
    totalDeSubcats += deSubcats;
  }

  console.log('\n' + '═'.repeat(80));
  console.log('\n📊 OVERALL SUMMARY\n');
  console.log('─'.repeat(80));
  console.log(`Subcategories: ${totalDeSubcats}/${totalNoSubcats} translated (${((totalDeSubcats/totalNoSubcats)*100).toFixed(1)}%)`);
  console.log(`Drawings: ${totalDeDrawings}/${totalNoDrawings} translated (${((totalDeDrawings / totalNoDrawings) * 100).toFixed(1)}%)`);
  console.log();
}

checkAllGermanDrawings().catch(console.error);
