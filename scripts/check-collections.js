/**
 * Script to check all collections in MongoDB
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('tegnogfarge');

    console.log('=== ALL COLLECTIONS IN DATABASE ===\n');

    const collections = await db.listCollections().toArray();

    for (const collInfo of collections) {
      const collName = collInfo.name;
      const count = await db.collection(collName).countDocuments();
      console.log(`${collName}: ${count} documents`);

      // Show sample document from each collection
      if (count > 0) {
        const sample = await db.collection(collName).findOne();
        console.log('  Sample document keys:', Object.keys(sample).join(', '));
        console.log('  Sample:', JSON.stringify(sample, null, 2).substring(0, 200) + '...');
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkCollections();
