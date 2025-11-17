/**
 * Delete duplicate Swedish translations based on baseDocumentId
 * Keeps the first created translation, deletes the rest
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function deleteDuplicatesByBase() {
  const client = getSanityClient();

  console.log('📊 Checking for Swedish subcategories with same baseDocumentId...\n');

  // Get all Swedish subcategories with creation time
  const swedishDocs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId,
      _createdAt
    } | order(_createdAt asc)
  `);

  console.log(`Found ${swedishDocs.length} Swedish subcategories\n`);

  // Group by baseDocumentId
  const byBase: Record<string, any[]> = {};
  swedishDocs.forEach((doc: any) => {
    if (!doc.baseDocumentId) {
      console.log(`⚠️  Orphaned translation (no baseDocumentId): "${doc.title}" (${doc._id})`);
      return;
    }

    if (!byBase[doc.baseDocumentId]) {
      byBase[doc.baseDocumentId] = [];
    }
    byBase[doc.baseDocumentId].push(doc);
  });

  // Find duplicates (baseDocumentId with multiple Swedish translations)
  const duplicates = Object.entries(byBase).filter(([, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log('✓ No duplicates found!\n');
    return;
  }

  console.log(`\n❌ Found ${duplicates.length} Norwegian documents with multiple Swedish translations:\n`);

  for (const [baseId, arr] of duplicates) {
    console.log(`\nNorwegian ID: ${baseId}`);
    console.log(`  ${arr.length} Swedish copies:\n`);

    // Show all copies with creation times
    arr.forEach((doc: any, i: number) => {
      console.log(`  ${i + 1}. "${doc.title}"`);
      console.log(`     Swedish ID: ${doc._id}`);
      console.log(`     Created: ${new Date(doc._createdAt).toISOString()}`);
    });

    // Keep the first one (oldest), delete the rest
    console.log(`\n  ✓ KEEPING: ${arr[0]._id} (oldest)`);

    for (let i = 1; i < arr.length; i++) {
      console.log(`  ✗ DELETING: ${arr[i]._id}`);
      await client.delete(arr[i]._id);
    }

    console.log(`  ✓ Cleaned up ${arr.length - 1} duplicate(s) for Norwegian ${baseId}`);
  }

  console.log(`\n✅ Duplicate cleanup complete!\n`);
}

deleteDuplicatesByBase();
