const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    // Check lead_submissions with emailHistory
    const submissions = await db.collection('lead_submissions')
      .find({ 'emailHistory.0': { $exists: true } })
      .limit(3)
      .toArray();

    console.log('=== SUBMISSIONS WITH EMAIL HISTORY ===');
    console.log('Total found:', submissions.length);
    if (submissions.length > 0) {
      console.log('\nFirst submission:');
      console.log('Email:', submissions[0].email);
      console.log('Campaign:', submissions[0].campaignId);
      console.log('Email history length:', submissions[0].emailHistory?.length || 0);
      if (submissions[0].emailHistory && submissions[0].emailHistory.length > 0) {
        console.log('Last email sent:', submissions[0].emailHistory[submissions[0].emailHistory.length - 1]);
      }
    }

    // Check tracking events
    const trackingEvents = await db.collection('email_tracking_events')
      .find({})
      .limit(5)
      .toArray();

    console.log('\n=== TRACKING EVENTS ===');
    console.log('Total tracking events:', trackingEvents.length);
    if (trackingEvents.length > 0) {
      console.log('First event:', trackingEvents[0]);
    }

    // Check for specific campaign
    const campaignSubmissions = await db.collection('lead_submissions')
      .find({
        campaignId: 'third-download-gate',
        'emailHistory.0': { $exists: true }
      })
      .toArray();

    console.log('\n=== THIRD-DOWNLOAD-GATE CAMPAIGN ===');
    console.log('Submissions with email history:', campaignSubmissions.length);

    const campaignTracking = await db.collection('email_tracking_events')
      .find({ campaignId: 'third-download-gate' })
      .toArray();

    console.log('Tracking events for campaign:', campaignTracking.length);

  } finally {
    await client.close();
  }
}

check().catch(console.error);
