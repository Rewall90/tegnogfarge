/**
 * Script to check ALL data in MongoDB
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAllData() {
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB\n');

    const db = client.db('fargeleggingsapp');

    console.log('=== CHECKING ALL COLLECTIONS ===\n');

    // List all collections
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('No collections found in database!');
      return;
    }

    for (const collInfo of collections) {
      const collName = collInfo.name;
      const count = await db.collection(collName).countDocuments();
      console.log(`\n📁 ${collName}: ${count} documents`);

      if (count > 0) {
        // Show first document
        const first = await db.collection(collName).findOne();
        console.log('  Keys:', Object.keys(first).join(', '));

        // For analytics-related collections, show more details
        if (collName.includes('download') || collName.includes('analytics') || collName.includes('counter')) {
          console.log('  Sample:', JSON.stringify(first, null, 2));
        }
      }
    }

    // Specifically check for analytics data
    console.log('\n\n=== ANALYTICS-SPECIFIC CHECKS ===');

    const analyticsCounters = await db.collection('analytics_counters').countDocuments();
    console.log(`\nanalytics_counters: ${analyticsCounters} documents`);
    if (analyticsCounters > 0) {
      const counters = await db.collection('analytics_counters').find({}).limit(5).toArray();
      console.log('Sample counters:');
      counters.forEach(c => console.log(`  - ${c.imageId}: ${c.count} (${c.eventType})`));
    }

    const uniqueDownloads = await db.collection('unique_downloads').countDocuments();
    console.log(`\nunique_downloads: ${uniqueDownloads} documents`);
    if (uniqueDownloads > 0) {
      const downloads = await db.collection('unique_downloads').find({}).sort({ downloadedAt: -1 }).limit(5).toArray();
      console.log('Recent downloads:');
      downloads.forEach(d => console.log(`  - ${d.imageId} by ${d.userIdentifier} at ${d.downloadedAt}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkAllData();
