/**
 * Check the two Swedish translations for "Mandala Fargelegging Blomster"
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function checkDuplicates() {
  const client = getSanityClient();

  const norwegianId = '0304eab1-bd03-4686-a1c8-c031e4b9990c';
  const swedishId1 = 'subcategory-bce205b0-0380-4f31-b176-dc8856bbdc45';
  const swedishId2 = '1pYa0Zm79VU7dual1IgEr1';

  console.log('🔍 Checking duplicate Swedish translations for "Mandala Fargelegging Blomster"...\n');

  // Get both Swedish documents
  const docs = await client.fetch(`
    *[_id in [$id1, $id2]]{
      _id,
      _createdAt,
      _updatedAt,
      title,
      description,
      "slug": slug.current,
      baseDocumentId,
      isActive
    } | order(_createdAt asc)
  `, { id1: swedishId1, id2: swedishId2 });

  docs.forEach((doc: any, i: number) => {
    console.log(`\n${i + 1}. Swedish Translation:`);
    console.log(`   ID: ${doc._id}`);
    console.log(`   Title: ${doc.title}`);
    console.log(`   Slug: ${doc.slug}`);
    console.log(`   Created: ${new Date(doc._createdAt).toISOString()}`);
    console.log(`   Description: ${doc.description?.substring(0, 80)}...`);
  });

  // Check which one is referenced by drawing images
  console.log('\n\n🔍 Checking drawing image references...\n');

  for (const doc of docs) {
    const drawings = await client.fetch(`
      *[_type == "drawingImage" && references($id)]{
        _id,
        title,
        language,
        "slug": slug.current
      }
    `, { id: doc._id });

    console.log(`Swedish ID: ${doc._id}`);
    console.log(`  Referenced by ${drawings.length} drawing image(s)`);
    if (drawings.length > 0) {
      drawings.forEach((drawing: any) => {
        console.log(`    - "${drawing.title}" (${drawing.language})`);
      });
    }
  }

  console.log('\n\n💡 Recommendation:');
  console.log('   Keep the OLDER one (created first) if it has drawing references');
  console.log('   Delete the NEWER one\n');
}

checkDuplicates();
