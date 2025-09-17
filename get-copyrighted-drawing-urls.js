import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: 'skUEtk3e3NAlADz1wcrtCp1ZC9LTwHemwLVInXv4v4EWDA62tG8VRHBXJnDYW9OLJyxtk03E4QaM1cp3kVBKPQFOjQm9MwIWoDyUKj7N5U3NNvMD6CzHLGSUOnK2M9aU4sQt5ba7BZA7WXd8RPTNtmEomJuAw0ohLmuCBwY7NCz1SnEFrtbB'
});

const copyrightedSubcategoryIds = [
  '0ee36888-dd85-4390-8e5b-1611d37810ec', // Pokemon Figurer
  '7946942b-c622-473e-b807-16b8674c8afb', // Fargelgg PawPatrol
  'd73b37fc-2d66-436e-9e21-ebd3ca3fdc51', // Fargelegg Ole Brumm
  'ab07aa95-db21-40df-8fae-980804cb5785', // Fargelegg Ninjago
  '790d299b-9ae8-4656-bbe0-d13582d3c690', // Fargelegg Minions
  '3ffdc5b9-e400-47e2-9d89-d284514aa736', // Fargelegg Karakterene i My Little Pony
  '21780f69-53f4-4aa2-a122-23bc41007982', // Fargelegg Hello Kitty
  '01781d83-f1de-43bd-9be6-5040e1fee4e5', // Fargelegg Harry Potter
  'feb10488-b0d3-4213-92a4-7d41fe8b27a0', // Fargelegg Elsa
  '6941859a-69cd-470a-ab2b-98b7ee213e6e', // Disney Prinsesser
  '8a19da8a-5aed-4552-91ba-141b3ee914bb', // Fargelegg Disney Figurer
  '6265e08e-b88e-43a9-8d33-10ba50645ed3', // Fargelegg Barbie
  '8629531d-3edf-4ede-9309-8695001471b9', // Fargelegg Spiderman
  'f4545a83-f722-4dca-a94e-5e60c85387be', // Fargelegg Sonic
  '2cb2b5c8-92b1-4182-8b09-5600adc2fe04', // Fargelegg Mario
  '1270073f-1bcb-4000-9255-4b12568e9d10', // Fargelegg DeadPool
  'dd1aeea8-b581-4b72-83a2-15b7ff0beacb'  // Fargelegg Captain America
];

async function getCopyrightedDrawingUrls() {
  console.log('🔍 FETCHING ALL COPYRIGHTED DRAWING URLS');
  console.log('='.repeat(50));

  try {
    const allDrawings = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref in $ids] {
        _id,
        title,
        "slug": slug.current,
        "subcategorySlug": subcategory->slug.current,
        "categorySlug": subcategory->parentCategory->slug.current,
        "subcategoryTitle": subcategory->title,
        isActive
      } | order(subcategorySlug asc, title asc)
    `, { ids: copyrightedSubcategoryIds });

    console.log(`📊 Found ${allDrawings.length} copyrighted drawings`);

    // Group by subcategory for better organization
    const groupedBySubcategory = {};
    allDrawings.forEach(drawing => {
      const key = drawing.subcategoryTitle;
      if (!groupedBySubcategory[key]) {
        groupedBySubcategory[key] = [];
      }
      groupedBySubcategory[key].push(drawing);
    });

    // Generate redirect rules for next.config.js
    console.log('\n📝 GENERATING 410 REDIRECT RULES FOR next.config.js:');
    console.log('='.repeat(60));
    console.log('\n// Add these redirect rules to next.config.js:');

    allDrawings.forEach(drawing => {
      const url = `/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawing.slug}`;
      console.log(`      {`);
      console.log(`        source: '${url}',`);
      console.log(`        destination: '/410-gone',`);
      console.log(`        permanent: true,`);
      console.log(`      },`);
    });

    console.log('\n📋 SUMMARY BY SUBCATEGORY:');
    console.log('='.repeat(40));

    Object.entries(groupedBySubcategory).forEach(([subcategory, drawings]) => {
      console.log(`\n${subcategory}: ${drawings.length} drawings`);
      drawings.forEach(drawing => {
        const url = `/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawing.slug}`;
        console.log(`  - ${url}`);
      });
    });

    // Generate a concise list for quick copy-paste
    console.log('\n🚀 QUICK COPY-PASTE REDIRECTS:');
    console.log('='.repeat(35));

    allDrawings.forEach(drawing => {
      const url = `/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawing.slug}`;
      console.log(`{ source: '${url}', destination: '/410-gone', permanent: true },`);
    });

    return allDrawings;

  } catch (error) {
    console.error('💥 Error fetching drawings:', error);
    return [];
  }
}

getCopyrightedDrawingUrls();