import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false, // Don't use CDN to get fresh data
});

async function findAllBjornDrawings() {
  console.log('\n🔍 Searching for ALL bear (bjørn/björn) drawings in Sanity...\n');

  // Search for drawings with "bjørn" or "björn" in the title
  const bearDrawings = await client.fetch(`
    *[_type == "drawingImage" && (
      title match "*bjørn*" ||
      title match "*björn*" ||
      title match "*bjorn*" ||
      title match "*bear*"
    )] | order(_createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      language,
      isActive,
      "subcategory": subcategory->{
        _id,
        title,
        "slug": slug.current,
        language
      },
      "category": subcategory->parentCategory->{
        title,
        "slug": slug.current
      }
    }
  `);

  console.log(`Found ${bearDrawings.length} bear-related drawings:\n`);

  // Group by language
  const byLanguage = {
    no: bearDrawings.filter((d: any) => d.language === 'no'),
    sv: bearDrawings.filter((d: any) => d.language === 'sv'),
  };

  console.log(`Norwegian drawings: ${byLanguage.no.length}`);
  console.log(`Swedish drawings: ${byLanguage.sv.length}\n`);

  // Show Norwegian drawings
  if (byLanguage.no.length > 0) {
    console.log('📋 Norwegian bear drawings:');
    byLanguage.no.forEach((d: any, i: number) => {
      console.log(`\n${i + 1}. "${d.title}"`);
      console.log(`   ID: ${d._id}`);
      console.log(`   Slug: ${d.slug}`);
      console.log(`   Active: ${d.isActive}`);
      console.log(`   Subcategory: ${d.subcategory?.title || 'NO SUBCATEGORY!'}`);
      console.log(`   Subcategory ID: ${d.subcategory?._id || 'N/A'}`);
      console.log(`   Category: ${d.category?.title || 'N/A'}`);
    });
  } else {
    console.log('❌ No Norwegian bear drawings found!');
  }

  // Show Swedish drawings
  if (byLanguage.sv.length > 0) {
    console.log('\n\n📋 Swedish bear drawings:');
    byLanguage.sv.forEach((d: any, i: number) => {
      console.log(`\n${i + 1}. "${d.title}"`);
      console.log(`   ID: ${d._id}`);
      console.log(`   Slug: ${d.slug}`);
      console.log(`   Active: ${d.isActive}`);
      console.log(`   Subcategory: ${d.subcategory?.title || 'NO SUBCATEGORY!'}`);
      console.log(`   Subcategory ID: ${d.subcategory?._id || 'N/A'}`);
      console.log(`   Category: ${d.category?.title || 'N/A'}`);
    });
  } else {
    console.log('\n\n❌ No Swedish bear drawings found!');
  }

  // Check specifically for the "Fargelegge Bjørn" subcategory
  console.log('\n\n🎯 Checking "Fargelegge Bjørn" subcategory specifically:');
  const bjornSubcatId = 'ae340d1f-f10d-4e81-bcb6-b470c71b3996';
  const drawingsInBjornSubcat = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $subcatId] {
      _id,
      title,
      language,
      isActive
    }
  `, { subcatId: bjornSubcatId });

  console.log(`Drawings linked to "Fargelegge Bjørn" subcategory: ${drawingsInBjornSubcat.length}`);
  if (drawingsInBjornSubcat.length > 0) {
    drawingsInBjornSubcat.forEach((d: any) => {
      console.log(`  - ${d.title} (${d.language}, active: ${d.isActive})`);
    });
  }
}

findAllBjornDrawings().catch(console.error);
