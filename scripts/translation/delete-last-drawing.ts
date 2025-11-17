/**
 * Delete the last Swedish drawing image with its metadata
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function deleteLastDrawing() {
  const client = getSanityClient();

  console.log('🗑️  Deleting metadata and last drawing image...\n');

  try {
    // Delete the metadata first
    await client.delete('translation.metadata-bdf4d794-e847-4434-8758-e71277708074');
    console.log('✓ Deleted metadata: translation.metadata-bdf4d794-e847-4434-8758-e71277708074');

    // Now delete the drawing image
    await client.delete('drawingImage-db03f3f1-6c9a-4bb6-829c-d00278b2168d');
    console.log('✓ Deleted drawing: "Blommor i runt mönster"\n');

    console.log('✅ All Swedish drawing images have been deleted!\n');
  } catch (error) {
    console.error('✗ Failed:', error);
  }
}

deleteLastDrawing();
