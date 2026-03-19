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
  console.log('Checking Fargelegge Flagg for recent uploads...\n');

  const norwegianSubcategory = await client.fetch(`
    *[_type == "subcategory" && language == "no" && slug.current == "fargelegge-flagg"][0] {
      _id,
      title,
      "slug": slug.current
    }
  `);

  if (!norwegianSubcategory) {
    console.log('Subcategory not found');
    return;
  }

  console.log('Subcategory:', norwegianSubcategory.title);
  console.log('ID:', norwegianSubcategory._id, '\n');

  // Get all Norwegian drawings, sorted by date
  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId && isActive == true] | order(publishedDate desc) {
      _id,
      title,
      "slug": slug.current,
      publishedDate
    }
  `, { subcategoryId: norwegianSubcategory._id });

  console.log('Total Norwegian flags:', norwegianDrawings.length, '\n');

  // Get Swedish translations
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

  // Show recently published (last 40 days)
  const today = new Date();
  const fortyDaysAgo = new Date(today.setDate(today.getDate() - 40));
  const recentDrawings = norwegianDrawings.filter(d => {
    const pubDate = new Date(d.publishedDate);
    return pubDate >= fortyDaysAgo;
  });

  if (recentDrawings.length > 0) {
    console.log('='.repeat(70));
    console.log('RECENT UPLOADS (last 40 days):', recentDrawings.length);
    console.log('='.repeat(70), '\n');
    
    recentDrawings.forEach((d, i) => {
      const isTranslated = translatedIds.has(d._id);
      const status = isTranslated ? '✅ Translated' : '❌ NOT TRANSLATED';
      console.log((i+1) + '. ' + status + ' - ' + d.title);
      console.log('   Date:', d.publishedDate, '\n');
    });
  }

  if (untranslated.length > 0) {
    console.log('='.repeat(70));
    console.log('ALL UNTRANSLATED FLAGS:', untranslated.length);
    console.log('='.repeat(70), '\n');
    
    untranslated.slice(0, 35).forEach((d, i) => {
      console.log((i+1) + '. ' + d.title);
      console.log('   Slug:', d.slug);
      console.log('   Date:', d.publishedDate, '\n');
    });
    
    if (untranslated.length > 35) {
      console.log('... and', untranslated.length - 35, 'more\n');
    }
  }
}

check().catch(console.error);
