/**
 * Quick script to delete specific Swedish documents for re-translation testing
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

// Load environment variables
dotenv.config();

async function deleteDocuments() {
  const client = getSanityClient();

  const documentsToDelete = [
    'JLXnJ6iM2xnWCFLJqj5jsE', // Fargelegg Muffin
    'JLXnJ6iM2xnWCFLJqj5lhS', // Fargelegge Kaker
  ];

  console.log('🗑️  Deleting test documents for re-translation...\n');

  for (const docId of documentsToDelete) {
    try {
      await client.delete(docId);
      console.log(`✓ Deleted ${docId}`);
    } catch (error) {
      console.error(`✗ Failed to delete ${docId}:`, error);
    }
  }

  console.log('\n✓ Test documents deleted. Ready for re-translation.');
}

deleteDocuments();
