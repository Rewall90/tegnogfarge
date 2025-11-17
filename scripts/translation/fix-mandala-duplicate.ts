/**
 * Fix the Mandala duplicate by:
 * 1. Updating drawing image to reference the better Swedish translation
 * 2. Deleting the old Swedish translation with outdated terminology
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function fixDuplicate() {
  const client = getSanityClient();

  const goodSwedishId = '1pYa0Zm79VU7dual1IgEr1'; // "Mandala Målarbilder Blommor" (better)
  const badSwedishId = 'subcategory-bce205b0-0380-4f31-b176-dc8856bbdc45'; // "Mandala Färgläggning Blommor" (old term)
  const drawingImageId = 'drawingImage-db03f3f1-6c9a-4bb6-829c-d00278b2168d';

  console.log('🔧 Fixing Mandala Blomster duplicate...\n');

  console.log('Step 1: Updating drawing image reference...');
  console.log(`  From: ${badSwedishId} ("Mandala Färgläggning Blommor")`);
  console.log(`  To:   ${goodSwedishId} ("Mandala Målarbilder Blommor")\n`);

  try {
    // Update the drawing image to reference the better Swedish subcategory
    await client
      .patch(drawingImageId)
      .set({
        subcategory: {
          _type: 'reference',
          _ref: goodSwedishId
        }
      })
      .commit();

    console.log('✓ Drawing image updated successfully!');

    // Now delete the old Swedish subcategory with outdated terminology
    console.log('\nStep 2: Deleting old Swedish translation with "Färgläggning" terminology...');

    await client.delete(badSwedishId);

    console.log('✓ Old Swedish translation deleted!');

    console.log('\n✅ Duplicate fixed successfully!');
    console.log('\nResult:');
    console.log('  ✓ Kept "Mandala Målarbilder Blommor" (natural Swedish)');
    console.log('  ✓ Deleted "Mandala Färgläggning Blommor" (old terminology)');
    console.log('  ✓ Drawing image now references the better translation\n');

  } catch (error) {
    console.error('✗ Failed:', error);
  }
}

fixDuplicate();
