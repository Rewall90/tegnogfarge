/**
 * Analyze when duplicate Swedish subcategories were created
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function analyzeDuplicates() {
  const client = getSanityClient();

  // Get all Swedish subcategories
  const docs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId,
      _createdAt
    } | order(baseDocumentId asc, _createdAt asc)
  `);

  console.log(`\n📊 Analyzing ${docs.length} Swedish subcategories...\n`);

  // Group by baseDocumentId
  const byBase: Record<string, any[]> = {};
  docs.forEach((d: any) => {
    if (!byBase[d.baseDocumentId]) {
      byBase[d.baseDocumentId] = [];
    }
    byBase[d.baseDocumentId].push(d);
  });

  // Find duplicates
  const duplicates = Object.entries(byBase).filter(([, arr]) => arr.length > 1);

  console.log(`❌ Found ${duplicates.length} documents with duplicates\n`);

  for (const [baseId, arr] of duplicates) {
    console.log(`\n${arr[0].title} (${arr.length} copies):`);
    console.log(`  Base: ${baseId}`);

    arr.forEach((doc: any, i: number) => {
      const date = new Date(doc._createdAt);
      console.log(`  ${i + 1}. Created: ${date.toISOString()}`);
      console.log(`     ID: ${doc._id}`);
    });

    // Calculate time gap between duplicates
    if (arr.length >= 2) {
      const first = new Date(arr[0]._createdAt);
      const last = new Date(arr[arr.length - 1]._createdAt);
      const gap = (last.getTime() - first.getTime()) / 1000 / 60; // minutes
      console.log(`  ⏱ Time between first and last: ${gap.toFixed(1)} minutes`);
    }
  }

  // Check if translationExists would work NOW
  console.log('\n\n🔍 Testing translationExists query...\n');

  if (duplicates.length > 0) {
    const [testBaseId] = duplicates[0];
    const count = await client.fetch(
      `count(*[
        _type == "subcategory" &&
        language == "sv" &&
        baseDocumentId == $baseDocumentId
      ])`,
      { baseDocumentId: testBaseId }
    );

    console.log(`Base ID: ${testBaseId}`);
    console.log(`Query result: Found ${count} Swedish translations`);
    console.log(count > 1 ? '❌ translationExists would return true (duplicates exist!)' : '✓ Query works correctly');
  }
}

analyzeDuplicates();
