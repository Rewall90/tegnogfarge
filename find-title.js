const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-13',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function findTitle() {
  const subcategory = await client.fetch(`
    *[_type == "subcategory" && language == "no" && slug.current == "fargelegg-bokstaver-og-alfabetet"][0] {
      _id,
      title,
      "slug": slug.current
    }
  `);

  if (subcategory) {
    console.log('Title:', subcategory.title);
    console.log('Slug:', subcategory.slug);
  }
}

findTitle().catch(console.error);
