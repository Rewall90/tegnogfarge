require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

const duplicateUrls = [
  '/kjoretoy/fargelegge-brannbil/brannbil-med-lang-stige',
  '/dyr/fargelegge-bjorn/isbjorn-star-pa-isen',
  '/hoytider/fargelegge-julen-for-barn/juletre-med-stjerne-og-kuler',
  '/hoytider/fargelegge-julekort/juletre-med-stjerne-og-kuler',
  '/hoytider/fargelegge-juletre/juletre-med-stjerne-og-pakker',
  '/hoytider/fargelegge-julen-for-barn/nissen-kjorer-slede-med-gaver',
  '/hoytider/fargelegge-julenissen/nissen-kommer-med-stor-sekk',
  '/natur/fargelegge-sol/sola-smiler-med-solbriller'
];

async function investigateRemainingDuplicates() {
  console.log('=== INVESTIGATING REMAINING 8 DUPLICATE URLS ===\n');

  for (const url of duplicateUrls) {
    const parts = url.split('/').filter(Boolean);
    const categorySlug = parts[0];
    const subcategorySlug = parts[1];
    const slug = parts[2];

    console.log(`\n📋 URL: ${url}`);
    console.log(`   Slug: "${slug}"\n`);

    const drawings = await client.fetch(`
      *[_type == "drawingImage" &&
        slug.current == $slug &&
        subcategory->slug.current == $subcategorySlug &&
        subcategory->parentCategory->slug.current == $categorySlug &&
        isActive == true &&
        language == "no" &&
        !(_id in path("drafts.**"))] {
        _id,
        title,
        "slug": slug.current,
        _createdAt,
        _updatedAt,
        downloadCount,
        "categorySlug": subcategory->parentCategory->slug.current,
        "categoryTitle": subcategory->parentCategory->title,
        "subcategorySlug": subcategory->slug.current,
        "subcategoryTitle": subcategory->title
      } | order(_createdAt desc)
    `, { slug, subcategorySlug, categorySlug });

    console.log(`   Found ${drawings.length} versions:\n`);

    drawings.forEach((d, i) => {
      console.log(`   Version ${i + 1}:`);
      console.log(`      ID: ${d._id}`);
      console.log(`      Title: ${d.title}`);
      console.log(`      Created: ${d._createdAt}`);
      console.log(`      Updated: ${d._updatedAt}`);
      console.log(`      Downloads: ${d.downloadCount || 0}`);
      console.log(`      Category: ${d.categoryTitle} > ${d.subcategoryTitle}`);
      console.log('');
    });

    console.log(`   Strategy: Keep version 1 (newest), rename version ${drawings.length} to "${slug}-${drawings.length}"\n`);
    console.log('   ---');
  }

  console.log('\n\n=== SUMMARY ===\n');
  console.log('These 8 duplicate URLs were not caught in the first fix because they have');
  console.log('the EXACT same URL (same category, subcategory, AND slug).\n');
  console.log('We need to run the fix script again to catch these.\n');
}

investigateRemainingDuplicates().catch(console.error);
