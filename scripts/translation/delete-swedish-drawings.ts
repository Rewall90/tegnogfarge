/**
 * Delete all Swedish drawing images to start fresh
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function deleteSwedishDrawings() {
  const client = getSanityClient();

  console.log('🔍 Fetching all Swedish drawing images...\n');

  // Get all Swedish drawing images
  const swedishDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "sv"] {
      _id,
      title,
      "slug": slug.current
    }
  `);

  if (swedishDrawings.length === 0) {
    console.log('✓ No Swedish drawing images found.\n');
    return;
  }

  console.log(`Found ${swedishDrawings.length} Swedish drawing images to delete:\n`);

  swedishDrawings.forEach((d: any, i: number) => {
    console.log(`${i + 1}. "${d.title}"`);
    console.log(`   ID: ${d._id}`);
    console.log(`   Slug: ${d.slug}`);
  });

  console.log(`\n🗑️  Deleting ${swedishDrawings.length} Swedish drawing images...\n`);

  let deleted = 0;
  let failed = 0;

  for (const drawing of swedishDrawings) {
    try {
      await client.delete(drawing._id);
      console.log(`✓ Deleted: "${drawing.title}" (${drawing._id})`);
      deleted++;
    } catch (error: any) {
      console.error(`✗ Failed to delete "${drawing.title}":`, error.message);
      failed++;
    }
  }

  console.log(`\n✅ Deletion complete!`);
  console.log(`   Deleted: ${deleted}`);
  console.log(`   Failed: ${failed}\n`);
}

deleteSwedishDrawings();
