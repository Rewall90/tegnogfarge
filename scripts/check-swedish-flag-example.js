#!/usr/bin/env node

const sanityClient = require('@sanity/client');
require('dotenv').config();

const client = sanityClient.default({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function checkSwedishFlag() {
  const subcategoryId = '384b514f-afb7-48fd-b0df-a4bab192065b';

  // Get one Swedish drawing example
  const example = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && subcategory._ref == $subcategoryId][0] {
      _id,
      title,
      language,
      baseDocumentId,
      subcategory,
      "subcategoryRef": subcategory._ref,
      "subcategoryData": subcategory->{
        _id,
        title,
        language,
        baseDocumentId
      }
    }
  `, { subcategoryId });

  console.log('=== EXAMPLE SWEDISH FLAG DRAWING ===\n');
  console.log(JSON.stringify(example, null, 2));
}

checkSwedishFlag().catch(console.error);
