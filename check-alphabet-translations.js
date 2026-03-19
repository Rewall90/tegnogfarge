const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-13',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function checkAlphabetTranslations() {
  console.log('🔍 Checking "fargelegg-bokstaver-og-alfabetet" translations...\n');

  // Find the Norwegian subcategory
  const norwegianSubcategory = await client.fetch(`
    *[_type == "subcategory" && language == "no" && slug.current == "fargelegg-bokstaver-og-alfabetet"][0] {
      _id,
      title,
      "slug": slug.current
    }
  `);

  if (!norwegianSubcategory) {
    console.log('❌ Norwegian subcategory "fargelegg-bokstaver-og-alfabetet" not found');
    return;
  }

  console.log(`✅ Found Norwegian subcategory: "${norwegianSubcategory.title}"`);
  console.log(`   ID: ${norwegianSubcategory._id}\n`);

  // Find the Swedish translation
  const swedishSubcategory = await client.fetch(`
    *[_type == "subcategory" && language == "sv" && baseDocumentId == $norwegianId][0] {
      _id,
      title,
      "slug": slug.current
    }
  `, { norwegianId: norwegianSubcategory._id });

  if (swedishSubcategory) {
    console.log(`✅ Found Swedish subcategory: "${swedishSubcategory.title}"`);
    console.log(`   ID: ${swedishSubcategory._id}\n`);
  } else {
    console.log('⚠️  No Swedish translation found for this subcategory\n');
  }

  // Get all Norwegian drawings in this subcategory
  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && subcategory._ref == $subcategoryId && isActive == true && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      publishedDate
    }
  `, { subcategoryId: norwegianSubcategory._id });

  console.log(`📊 Norwegian drawings: ${norwegianDrawings.length}\n`);

  // Get all existing Swedish translations
  const norwegianIds = norwegianDrawings.map(d => d._id);
  const swedishDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && baseDocumentId in $norwegianIds] {
      baseDocumentId,
      title,
      _id
    }
  `, { norwegianIds });

  const translatedIds = new Set(swedishDrawings.map(d => d.baseDocumentId));

  // Find untranslated drawings
  const untranslated = norwegianDrawings.filter(d => !translatedIds.has(d._id));

  console.log('=' .repeat(70));
  console.log('\n📋 TRANSLATION STATUS\n');
  console.log('=' .repeat(70) + '\n');

  console.log(`Total Norwegian drawings: ${norwegianDrawings.length}`);
  console.log(`Already translated to Swedish: ${swedishDrawings.length}`);
  console.log(`Need translation: ${untranslated.length}\n`);

  if (untranslated.length > 0) {
    console.log('=' .repeat(70));
    console.log('\n🆕 DRAWINGS THAT NEED TRANSLATION:\n');
    console.log('=' .repeat(70) + '\n');
    
    untranslated.forEach((drawing, index) => {
      console.log(`${index + 1}. ${drawing.title}`);
      console.log(`   Slug: ${drawing.slug}`);
      console.log(`   Published: ${drawing.publishedDate}`);
      console.log(`   ID: ${drawing._id}\n`);
    });
  } else {
    console.log('✅ All drawings are already translated!\n');
  }

  console.log('=' .repeat(70) + '\n');

  if (untranslated.length > 0) {
    console.log('🚀 TO TRANSLATE THESE DRAWINGS, RUN:\n');
    console.log('   npm run translate:by-subcategory -- --subcategory="fargelegg-bokstaver-og-alfabetet"\n');
    console.log('=' .repeat(70) + '\n');
  }
}

checkAlphabetTranslations().catch(console.error);
