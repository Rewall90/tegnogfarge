/**
 * Check campaign stats in MongoDB
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env.local');
  process.exit(1);
}

async function checkStats() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db();

    // Check stats for photo-to-coloring-test
    const statsCollection = db.collection('lead_campaign_stats');
    const stats = await statsCollection.findOne({ campaignId: 'photo-to-coloring-test' });

    console.log('=== Campaign Stats for photo-to-coloring-test ===');
    if (stats) {
      console.log('Shown Count:', stats.shownCount || 0);
      console.log('Submitted Count:', stats.submittedCount || 0);
      console.log('Dismissed Count:', stats.dismissedCount || 0);
      console.log('Total Events:', stats.totalEvents || 0);
      console.log('Last Updated:', stats.lastUpdated);
    } else {
      console.log('No stats found yet.');
    }

    // Check events
    console.log('\n=== Recent Events ===');
    const eventsCollection = db.collection('lead_campaign_events');
    const recentEvents = await eventsCollection
      .find({ campaignId: 'photo-to-coloring-test' })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    if (recentEvents.length === 0) {
      console.log('No events found yet.');
    } else {
      recentEvents.forEach((event, i) => {
        console.log(`${i + 1}. ${event.eventType} - ${event.timestamp}`);
        if (event.metadata) {
          console.log(`   Metadata:`, event.metadata);
        }
      });
    }

    // Check submissions
    console.log('\n=== Recent Submissions ===');
    const submissionsCollection = db.collection('lead_submissions');
    const recentSubmissions = await submissionsCollection
      .find({ campaignId: 'photo-to-coloring-test' })
      .sort({ submittedAt: -1 })
      .limit(5)
      .toArray();

    if (recentSubmissions.length === 0) {
      console.log('No submissions found yet.');
    } else {
      recentSubmissions.forEach((sub, i) => {
        console.log(`${i + 1}. ${sub.email} - ${sub.submittedAt} - Verified: ${sub.isVerified}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkStats();
