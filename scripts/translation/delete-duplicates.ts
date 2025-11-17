/**
 * Delete duplicate Swedish subcategories (keep first, delete rest)
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function deleteDuplicates() {
  const client = getSanityClient();

  const swedishDocs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId,
      "slug": slug.current
    } | order(_createdAt asc)
  `);

  console.log(`\n📊 Checking ${swedishDocs.length} Swedish subcategories for duplicates...\n`);

  const titles: Record<string, any[]> = {};
  swedishDocs.forEach((d: any) => {
    if (titles[d.title]) {
      titles[d.title].push(d);
    } else {
      titles[d.title] = [d];
    }
  });

  const duplicates = Object.entries(titles).filter(([, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log('✓ No duplicates found!');
    return;
  }

  console.log(`❌ Found ${duplicates.length} duplicate titles\n`);

  let deleted = 0;

  for (const [title, arr] of duplicates) {
    console.log(`\n"${title}" (${arr.length} copies):`);
    console.log(`  ✓ KEEPING: ${arr[0]._id}`);

    // Delete all except the first one
    for (let i = 1; i < arr.length; i++) {
      try {
        await client.delete(arr[i]._id);
        console.log(`  ✗ DELETED: ${arr[i]._id}`);
        deleted++;
      } catch (error: any) {
        console.error(`  ✗ FAILED to delete ${arr[i]._id}:`, error.message);
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`  Total duplicates found: ${duplicates.length}`);
  console.log(`  Documents deleted: ${deleted}`);
  console.log(`\n✓ Duplicate cleanup complete!`);
}

deleteDuplicates();
