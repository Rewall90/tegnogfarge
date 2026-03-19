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
  const flagsToCheck = [
    'norges-flagg-med-rodt-og-blatt',
    'flagget-til-colombia',
    'flagget-til-etiopia',
    'jamaicas-fine-flagg',
    'flagget-til-vietnam'
  ];

  console.log('Checking if these 5 flags exist in Sanity...\n');

  for (const slug of flagsToCheck) {
    const drawing = await client.fetch(`
      *[_type == "drawingImage" && language == "no" && slug.current == $slug][0] {
        _id,
        title,
        publishedDate
      }
    `, { slug });

    if (drawing) {
      console.log('✅ EXISTS:', drawing.title);
      console.log('   Published:', drawing.publishedDate);
      console.log('   ID:', drawing._id, '\n');
    } else {
      console.log('❌ NOT FOUND:', slug, '\n');
    }
  }
}

check().catch(console.error);
