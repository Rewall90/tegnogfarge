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
  console.log('🔍 INVESTIGATING: Fargelegge Vennskap Anomaly\n');
  console.log('='.repeat(70));

  // Get the Norwegian subcategory
  const noSub = await client.fetch(
    `*[_type == "subcategory" && language == "no" && title == "Fargelegge Vennskap"][0]{ _id, title }`
  );

  if (!noSub) {
    console.log('❌ Norwegian subcategory not found');
    return;
  }

  console.log(`\n📂 Norwegian Subcategory: ${noSub.title}`);
  console.log(`   ID: ${noSub._id}\n`);

  // Get the German subcategory
  const deSub = await client.fetch(
    `*[_type == "subcategory" && language == "de" && baseDocumentId == $baseId][0]{ _id, title }`,
    { baseId: noSub._id }
  );

  console.log(`📂 German Subcategory: ${deSub.title}`);
  console.log(`   ID: ${deSub._id}\n`);

  console.log('='.repeat(70));

  // Get all Norwegian drawings
  const noDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "no" && subcategory._ref == $subId] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }`,
    { subId: noSub._id }
  );

  console.log(`\n✓ Found ${noDrawings.length} Norwegian drawings\n`);

  // Get all German drawings
  const deDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "de" && subcategory._ref == $deSubId] | order(title asc) {
      _id,
      title,
      baseDocumentId,
      "slug": slug.current
    }`,
    { deSubId: deSub._id }
  );

  console.log(`✓ Found ${deDrawings.length} German drawings\n`);

  console.log('='.repeat(70));
  console.log('\n🔍 CHECKING FOR DUPLICATES:\n');

  // Check if any German drawings have the same baseDocumentId
  const baseDocIds = deDrawings.map(d => d.baseDocumentId);
  const duplicateBaseDocIds = baseDocIds.filter((id, index) => baseDocIds.indexOf(id) !== index);

  if (duplicateBaseDocIds.length > 0) {
    console.log(`⚠️  Found ${duplicateBaseDocIds.length} duplicate German translations!\n`);

    for (const dupId of duplicateBaseDocIds) {
      const dups = deDrawings.filter(d => d.baseDocumentId === dupId);
      const noDrawing = noDrawings.find(d => d._id === dupId);

      console.log(`Duplicate for: ${noDrawing ? noDrawing.title : dupId}`);
      dups.forEach((dup, i) => {
        console.log(`  ${i + 1}. ${dup.title} (${dup._id})`);
        console.log(`     Slug: ${dup.slug}`);
      });
      console.log('');
    }
  }

  // Check for German drawings with missing baseDocumentId
  const missingBase = deDrawings.filter(d => !d.baseDocumentId);
  if (missingBase.length > 0) {
    console.log(`⚠️  Found ${missingBase.length} German drawings without baseDocumentId:\n`);
    missingBase.forEach(d => {
      console.log(`  - ${d.title} (${d._id})`);
    });
    console.log('');
  }

  // Check for German drawings pointing to non-existent Norwegian drawings
  const orphanedGerman = deDrawings.filter(d => {
    if (!d.baseDocumentId) return false;
    return !noDrawings.find(no => no._id === d.baseDocumentId);
  });

  if (orphanedGerman.length > 0) {
    console.log(`⚠️  Found ${orphanedGerman.length} German drawings with invalid baseDocumentId:\n`);
    for (const orphan of orphanedGerman) {
      console.log(`  - ${orphan.title} (${orphan._id})`);
      console.log(`    baseDocumentId: ${orphan.baseDocumentId}`);

      // Check if the baseDocumentId exists but points to a different subcategory
      const actualBase = await client.fetch(
        `*[_id == $baseId][0]{ _id, title, "subcat": subcategory._ref }`,
        { baseId: orphan.baseDocumentId }
      );

      if (actualBase) {
        console.log(`    ⚠️  Base document exists but is in different subcategory!`);
        console.log(`       Norwegian: ${actualBase.title}`);
        console.log(`       In subcategory: ${actualBase.subcat}`);
      } else {
        console.log(`    ❌ Base document does not exist`);
      }
      console.log('');
    }
  }

  // Check for Norwegian drawings without German translation
  const missingTranslations = noDrawings.filter(no => {
    return !deDrawings.find(de => de.baseDocumentId === no._id);
  });

  if (missingTranslations.length > 0) {
    console.log(`⚠️  Found ${missingTranslations.length} Norwegian drawings without German translation:\n`);
    missingTranslations.forEach(d => {
      console.log(`  - ${d.title} (${d._id})`);
    });
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`Norwegian drawings: ${noDrawings.length}`);
  console.log(`German drawings: ${deDrawings.length}`);
  console.log(`Difference: ${deDrawings.length - noDrawings.length}\n`);

  console.log('Issues found:');
  console.log(`  - Duplicate translations: ${duplicateBaseDocIds.length}`);
  console.log(`  - Missing baseDocumentId: ${missingBase.length}`);
  console.log(`  - Orphaned German drawings: ${orphanedGerman.length}`);
  console.log(`  - Missing translations: ${missingTranslations.length}\n`);

  const totalIssues = duplicateBaseDocIds.length + missingBase.length + orphanedGerman.length;

  if (totalIssues > 0) {
    console.log('⚠️  Issues detected that explain the anomaly!\n');
    console.log('Recommended actions:');
    if (duplicateBaseDocIds.length > 0) {
      console.log('  1. Delete duplicate German drawings (keep the oldest one)');
    }
    if (orphanedGerman.length > 0) {
      console.log('  2. Delete or fix orphaned German drawings');
    }
    if (missingBase.length > 0) {
      console.log('  3. Add baseDocumentId to German drawings without it');
    }
  } else {
    console.log('✅ No issues found - the count should match!\n');
  }

  console.log('='.repeat(70));
})();
