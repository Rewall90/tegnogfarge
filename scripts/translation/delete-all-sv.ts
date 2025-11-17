/**
 * Delete all Swedish translations for a fresh start
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function deleteAllSwedishDocuments(documentType: string) {
  const client = getSanityClient();

  console.log(`🗑️  Deleting all Swedish ${documentType} documents...\n`);

  // Fetch all Swedish documents of this type
  const swedishDocs = await client.fetch(
    `*[_type == $documentType && language == "sv"]{_id, title}`,
    { documentType }
  );

  console.log(`Found ${swedishDocs.length} Swedish ${documentType} documents to delete\n`);

  if (swedishDocs.length === 0) {
    console.log('✓ No Swedish documents to delete');
    return;
  }

  // Delete them one by one
  let deleted = 0;
  let failed = 0;

  for (const doc of swedishDocs) {
    try {
      await client.delete(doc._id);
      deleted++;
      console.log(`✓ Deleted [${deleted}/${swedishDocs.length}] ${doc.title || doc._id}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed to delete ${doc._id}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✓ Deleted: ${deleted}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`\n✓ Ready for fresh translation with improved glossary!`);
}

const documentType = process.argv[2] || 'subcategory';
deleteAllSwedishDocuments(documentType);
