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

async function findMissingDrawings() {
  const subcategories = [
    'Fargelegg Tegning Av Bondegård',
    'Fargelegge Regnbuen',
    'Fargelegge Skjell'
  ];

  for (const subcategoryTitle of subcategories) {
    console.log(`\n🔍 Checking: ${subcategoryTitle}`);
    console.log('='.repeat(80));

    // Find Norwegian subcategory
    const noSubcat = await client.fetch(`
      *[_type == "subcategory" && language == "no" && title == $title][0]{
        _id,
        title
      }
    `, { title: subcategoryTitle });

    if (!noSubcat) {
      console.log(`❌ Could not find Norwegian subcategory`);
      continue;
    }

    // Get all Norwegian drawings
    const noDrawings = await client.fetch(`
      *[_type == "drawingImage" && language == "no" && isActive == true && subcategory._ref == $subcategoryId] | order(title asc) {
        _id,
        title
      }
    `, { subcategoryId: noSubcat._id });

    console.log(`\nTotal Norwegian drawings: ${noDrawings.length}`);

    // Check which ones are missing Swedish translations
    const missing: string[] = [];

    for (const drawing of noDrawings) {
      const svTranslation = await client.fetch(`
        *[_type == "drawingImage" && language == "sv" && baseDocumentId == $drawingId][0]{
          _id
        }
      `, { drawingId: drawing._id });

      if (!svTranslation) {
        missing.push(drawing.title);
        console.log(`\n❌ Missing translation: "${drawing.title}"`);
        console.log(`   ID: ${drawing._id}`);
      }
    }

    if (missing.length === 0) {
      console.log(`\n✅ All drawings have translations!`);
    } else {
      console.log(`\n⚠ Total missing: ${missing.length}`);
    }
  }
}

findMissingDrawings().catch(console.error);
