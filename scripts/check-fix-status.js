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

const NORWEGIAN_SUBCATEGORY_ID = '384b514f-afb7-48fd-b0df-a4bab192065b';
const SWEDISH_SUBCATEGORY_ID = 'k57DOWbQt745Wk8upl7CjS';

async function checkFixStatus() {
  console.log('=== CHECKING FIX STATUS ===\n');

  // Count Swedish drawings still pointing to Norwegian subcategory
  const stillWrong = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && subcategory._ref == $norwegianId])
  `, { norwegianId: NORWEGIAN_SUBCATEGORY_ID });

  // Count Swedish drawings now pointing to Swedish subcategory
  const nowCorrect = await client.fetch(`
    count(*[_type == "drawingImage" && language == "sv" && subcategory._ref == $swedishId])
  `, { swedishId: SWEDISH_SUBCATEGORY_ID });

  console.log(`✓ Swedish drawings pointing to Swedish subcategory: ${nowCorrect}`);
  console.log(`⚠ Swedish drawings still pointing to Norwegian subcategory: ${stillWrong}\n`);

  if (stillWrong > 0) {
    console.log('🔧 Need to continue fixing the remaining drawings...\n');
  } else {
    console.log('✅ All Swedish drawings are now correctly referenced!\n');
  }
}

checkFixStatus().catch(console.error);
