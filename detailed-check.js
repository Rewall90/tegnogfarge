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
  console.log('🔍 Detailed Check: Tegneserier Translation\n');
  console.log('='.repeat(70));

  // Get one specific subcategory to debug
  const noSub = await client.fetch(`*[_type == "subcategory" && language == "no" && title == "Fargelegg Enhjørninger"][0]{ _id, title }`);
  console.log('\nNorwegian subcategory:', noSub);

  const deSub = await client.fetch(`*[_type == "subcategory" && language == "de" && baseDocumentId == $baseId][0]{ _id, title, baseDocumentId }`, { baseId: noSub._id });
  console.log('German subcategory:', deSub);

  // Count Norwegian drawings
  const noDrawingCount = await client.fetch(`count(*[_type == "drawingImage" && language == "no" && subcategory._ref == $subId])`, { subId: noSub._id });
  console.log(`\nNorwegian drawings under "${noSub.title}": ${noDrawingCount}`);

  // Get a sample Norwegian drawing
  const noDrawing = await client.fetch(`*[_type == "drawingImage" && language == "no" && subcategory._ref == $subId][0]{ _id, title, subcategory }`, { subId: noSub._id });
  console.log('Sample Norwegian drawing:', noDrawing);

  // Check if this drawing has a German translation
  const deDrawing = await client.fetch(`*[_type == "drawingImage" && language == "de" && baseDocumentId == $baseId][0]{ _id, title, baseDocumentId, subcategory }`, { baseId: noDrawing._id });
  console.log('German translation of this drawing:', deDrawing);

  // Count all German drawings with baseDocumentId pointing to drawings in this NO subcategory
  const deDrawingCount = await client.fetch(`count(*[_type == "drawingImage" && language == "de" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == $subId]._id])`, { subId: noSub._id });
  console.log(`\nGerman drawings (by baseDocumentId): ${deDrawingCount}`);

  // Check if German drawings reference the German subcategory
  const deDrawingsRefGerman = await client.fetch(`count(*[_type == "drawingImage" && language == "de" && subcategory._ref == $deSubId])`, { deSubId: deSub._id });
  console.log(`German drawings referencing German subcategory: ${deDrawingsRefGerman}`);

  // Get all German drawings for this subcategory
  const allDeDrawings = await client.fetch(`*[_type == "drawingImage" && language == "de" && subcategory._ref == $deSubId][0..5]{ _id, title, "subRef": subcategory._ref }`, { deSubId: deSub._id });
  console.log('\nSample German drawings (first 5):');
  allDeDrawings.forEach(d => console.log(`  - ${d.title} (subcategory ref: ${d.subRef})`));

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Summary:');
  console.log(`   German subcategory exists: ${!!deSub}`);
  console.log(`   Norwegian drawings: ${noDrawingCount}`);
  console.log(`   German drawings: ${deDrawingsRefGerman}`);
  console.log(`   Match: ${noDrawingCount === deDrawingsRefGerman ? '✅ YES' : '❌ NO'}`);
})();
