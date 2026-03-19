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
  // Quick count
  const counts = await client.fetch(`{
    "noDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref in *[_type == "subcategory" && language == "no" && parentCategory._ref == "7e95008e-5892-4492-ad6e-3d128015b66c" && isActive == true]._id]),
    "deDrawings": count(*[_type == "drawingImage" && language == "de" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref in *[_type == "subcategory" && language == "no" && parentCategory._ref == "7e95008e-5892-4492-ad6e-3d128015b66c" && isActive == true]._id]._id])
  }`);

  console.log('Quick count for Tegneserier (active subcategories only):');
  console.log('Norwegian drawings:', counts.noDrawings);
  console.log('German drawings:', counts.deDrawings);
})();
