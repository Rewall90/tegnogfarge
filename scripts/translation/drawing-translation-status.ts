/**
 * Check drawing image translation status
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function checkStatus() {
  const client = getSanityClient();

  console.log('🔍 Checking drawing image translation status...\n');

  // Get Norwegian drawings
  const norwegianDocs = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**"))] {
      _id,
      title,
      "slug": slug.current
    } | order(_createdAt asc)
  `);

  // Get Swedish drawings with baseDocumentId
  const swedishDocs = await client.fetch(`
    *[_type == "drawingImage" && language == "sv"] {
      _id,
      title,
      baseDocumentId
    }
  `);

  const translatedIds = new Set(swedishDocs.map((d: any) => d.baseDocumentId));

  const translated = norwegianDocs.filter((d: any) => translatedIds.has(d._id));
  const notTranslated = norwegianDocs.filter((d: any) => !translatedIds.has(d._id));

  console.log(`📊 Summary:`);
  console.log(`   Norwegian (active, published): ${norwegianDocs.length}`);
  console.log(`   Swedish translations: ${swedishDocs.length}`);
  console.log(`   Translated: ${translated.length}`);
  console.log(`   Not translated: ${notTranslated.length}`);
  console.log(`   Coverage: ${((translated.length / norwegianDocs.length) * 100).toFixed(1)}%\n`);

  if (notTranslated.length > 0) {
    console.log(`\n📝 First 10 Norwegian drawings that need translation:\n`);
    notTranslated.slice(0, 10).forEach((d: any, i: number) => {
      console.log(`${i + 1}. "${d.title}"`);
      console.log(`   ID: ${d._id}`);
      console.log(`   Slug: ${d.slug}\n`);
    });
  }
}

checkStatus();
