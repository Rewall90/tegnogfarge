const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkFeiringTranslations() {
  console.log('\n📊 CHECKING FEIRING/FEIER SUBCATEGORIES\n');
  console.log('='.repeat(70) + '\n');

  // Get German Feier category
  const germanCategory = await client.fetch(
    '*[_type == "category" && language == "de" && baseDocumentId == "dc3b71da-1d1e-42a9-9ad0-8f6f748a4742"][0]{_id, title}'
  );

  console.log('✓ German category:', germanCategory.title, '(' + germanCategory._id + ')\n');

  // Get German subcategories
  const germanSubcategories = await client.fetch(
    `*[_type == "subcategory" && language == "de" && parentCategory._ref == "${germanCategory._id}"]{_id, title, baseDocumentId, 'parentRef': parentCategory._ref}`
  );

  console.log(`German subcategories under Feier: ${germanSubcategories.length}`);
  germanSubcategories.forEach(sub => {
    console.log(`  - ${sub.title} (${sub._id})`);
    console.log(`    baseDocumentId: ${sub.baseDocumentId}`);
    console.log(`    parentCategory: ${sub.parentRef}\n`);
  });

  // Check Norwegian originals
  const norwegianSubcats = await client.fetch(
    '*[_type == "subcategory" && language == "no" && (title match "*Ballong*" || title match "*Vennskap*")]{_id, title, "parentCat": parentCategory._ref}'
  );

  console.log(`\nNorwegian subcategories (Ballong/Vennskap): ${norwegianSubcats.length}`);
  norwegianSubcats.forEach(sub => {
    console.log(`  - ${sub.title} (${sub._id})`);
    console.log(`    parentCategory: ${sub.parentCat}\n`);
  });

  // Check which German translations exist
  console.log('Translation status:');
  for (const noSub of norwegianSubcats) {
    const germanTranslation = await client.fetch(
      `*[_type == "subcategory" && language == "de" && baseDocumentId == "${noSub._id}"][0]{_id, title, 'parentRef': parentCategory._ref}`
    );

    if (germanTranslation) {
      console.log(`  ✓ ${noSub.title} → ${germanTranslation.title}`);
      console.log(`    ID: ${germanTranslation._id}`);
      console.log(`    Parent: ${germanTranslation.parentRef}`);
      console.log(`    Correct parent? ${germanTranslation.parentRef === germanCategory._id ? 'YES' : 'NO - WRONG!'}\n`);
    } else {
      console.log(`  ✗ ${noSub.title} → NOT TRANSLATED\n`);
    }
  }

  // Check drawings
  const germanDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "de" && baseDocumentId in *[_type == "drawingImage" && language == "no" && (subcategory._ref in ${JSON.stringify(norwegianSubcats.map(s => s._id))})]._id]{
      _id,
      title,
      'subcategoryRef': subcategory._ref,
      baseDocumentId
    }`
  );

  console.log(`\n📄 German drawings: ${germanDrawings.length}`);

  // Group by subcategory
  const drawingsBySubcat = {};
  germanDrawings.forEach(d => {
    if (!drawingsBySubcat[d.subcategoryRef]) {
      drawingsBySubcat[d.subcategoryRef] = [];
    }
    drawingsBySubcat[d.subcategoryRef].push(d);
  });

  Object.entries(drawingsBySubcat).forEach(([subcatId, drawings]) => {
    const subcatName = germanSubcategories.find(s => s._id === subcatId)?.title || subcatId;
    console.log(`  ${subcatName}: ${drawings.length} drawings`);
  });
}

checkFeiringTranslations().catch(console.error);
