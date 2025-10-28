/**
 * Script to check timestamp formats in MongoDB
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkTimestamps() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('fargeleggingsapp');
    const collection = db.collection('unique_downloads');

    console.log('=== CHECKING UNIQUE_DOWNLOADS TIMESTAMPS ===\n');

    // Get total count
    const total = await collection.countDocuments();
    console.log(`Total documents: ${total}\n`);

    // Get some recent downloads
    const recent = await collection
      .find({})
      .sort({ downloadedAt: -1 })
      .limit(10)
      .toArray();

    console.log('Recent 10 downloads:');
    recent.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.downloadedAt} (${typeof doc.downloadedAt})`);
      console.log(`   User: ${doc.userIdentifier}`);
      console.log(`   Image: ${doc.imageId}`);
      console.log(`   Event: ${doc.eventType}`);
      console.log('');
    });

    // Check today's data with different date approaches
    const now = new Date();
    console.log('\n=== TESTING DATE QUERIES ===');
    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Your local time: ${now.toString()}\n`);

    // Test 1: Today with UTC midnight
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const todayUTCCount = await collection.countDocuments({
      downloadedAt: { $gte: todayUTC }
    });
    console.log(`Test 1 - Today from UTC midnight (${todayUTC.toISOString()}): ${todayUTCCount}`);

    // Test 2: Today with local midnight
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const todayLocalCount = await collection.countDocuments({
      downloadedAt: { $gte: todayLocal }
    });
    console.log(`Test 2 - Today from local midnight (${todayLocal.toISOString()}): ${todayLocalCount}`);

    // Test 3: Last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hCount = await collection.countDocuments({
      downloadedAt: { $gte: last24h }
    });
    console.log(`Test 3 - Last 24 hours (${last24h.toISOString()}): ${last24hCount}`);

    // Test 4: Today with date string approach (what our API uses)
    const todayStr = now.toISOString().split('T')[0];
    const todayStrStart = new Date(todayStr + 'T00:00:00.000Z');
    const todayStrEnd = new Date(todayStr + 'T23:59:59.999Z');
    const todayStrCount = await collection.countDocuments({
      downloadedAt: { $gte: todayStrStart, $lte: todayStrEnd }
    });
    console.log(`Test 4 - Today using string approach (${todayStrStart.toISOString()} to ${todayStrEnd.toISOString()}): ${todayStrCount}`);

    // Show what dates we're comparing against
    console.log('\n=== DATE BREAKDOWN ===');
    if (recent.length > 0 && recent[0].downloadedAt) {
      const latestDownload = new Date(recent[0].downloadedAt);
      console.log(`Latest download: ${latestDownload.toISOString()}`);
      console.log(`Latest download (local): ${latestDownload.toString()}`);
      console.log(`Today UTC midnight: ${todayUTC.toISOString()}`);
      console.log(`Today local midnight: ${todayLocal.toISOString()}`);
      console.log(`Difference (hours): ${(latestDownload - todayLocal) / (1000 * 60 * 60)}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkTimestamps();
