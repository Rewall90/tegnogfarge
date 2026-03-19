const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-13',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function check() {
  console.log('Checking translations...\n');

  const norwegianSubcategory = await client.fetch(`
    *[_type == "subcategory" && language == "no" && slug.current == "fargelegg-bokstaver-og-alfabetet"][0] {
      _id,
      title,
      "slug": slug.current
    }
  `);

  if (!norwegianSubcategory) {
    console.log('Not found');
    return;
  }

  console.log('Found:', norwegianSubcategory.title);
  console.log('ID:', norwegianSubcategory._id, '\n');

  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId && isActive == true] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      publishedDate
    }
  `, { subcategoryId: norwegianSubcategory._id });

  console.log('Total Norwegian drawings:', norwegianDrawings.length, '\n');

  const norwegianIds = norwegianDrawings.map(d => d._id);
  const swedishDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && baseDocumentId in $norwegianIds] {
      baseDocumentId,
      title
    }
  `, { norwegianIds });

  const translatedIds = new Set(swedishDrawings.map(d => d.baseDocumentId));
  const untranslated = norwegianDrawings.filter(d => !translatedIds.has(d._id));

  console.log('Already translated:', swedishDrawings.length);
  console.log('Need translation:', untranslated.length, '\n');

  if (untranslated.length > 0) {
    console.log('UNTRANSLATED DRAWINGS:\n');
    untranslated.forEach((d, i) => {
      console.log((i+1) + '. ' + d.title);
      console.log('   Slug:', d.slug);
      console.log('   Date:', d.publishedDate, '\n');
    });
  } else {
    console.log('All translated!\n');
  }
}

check().catch(console.error);
