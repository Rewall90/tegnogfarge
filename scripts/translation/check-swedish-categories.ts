#!/usr/bin/env ts-node

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function checkSwedishCategories() {
  const swedishCategories = await client.fetch(`
    *[_type == "category" && language == "sv"]{
      _id,
      title,
      slug,
      isActive
    }
  `);

  console.log('Swedish Categories:');
  console.log(JSON.stringify(swedishCategories, null, 2));
  console.log(`\nTotal: ${swedishCategories.length}`);
}

checkSwedishCategories().catch(console.error);
