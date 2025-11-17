/**
 * Fix the orphaned Swedish subcategory by setting the correct baseDocumentId
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function fixOrphan() {
  const client = getSanityClient();

  const swedishId = 'subcategory-bce205b0-0380-4f31-b176-dc8856bbdc45';
  const norwegianId = '0304eab1-bd03-4686-a1c8-c031e4b9990c'; // Mandala Fargelegging Blomster

  console.log('🔧 Fixing orphaned Swedish subcategory...\n');

  console.log('Swedish: "Mandala Färgläggning Blommor"');
  console.log(`  ID: ${swedishId}`);
  console.log('\nNorwegian: "Mandala Fargelegging Blomster"');
  console.log(`  ID: ${norwegianId}`);

  console.log('\n✓ Setting baseDocumentId...');

  try {
    await client
      .patch(swedishId)
      .set({ baseDocumentId: norwegianId })
      .commit();

    console.log('✓ Successfully updated baseDocumentId!');
    console.log(`\nThe Swedish subcategory is now properly linked to its Norwegian original.\n`);
  } catch (error) {
    console.error('✗ Failed to update:', error);
  }
}

fixOrphan();
