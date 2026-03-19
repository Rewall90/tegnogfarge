const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    const submissions = await db.collection('lead_submissions')
      .find({ 'emailHistory.0': { $exists: true } })
      .toArray();

    console.log('=== ALL CAMPAIGNS WITH EMAIL HISTORY ===');
    const campaigns = {};
    submissions.forEach(s => {
      if (!campaigns[s.campaignId]) campaigns[s.campaignId] = 0;
      campaigns[s.campaignId]++;
    });

    Object.entries(campaigns).forEach(([campaign, count]) =>
      console.log(`${campaign}: ${count} emails sent`)
    );

    console.log(`\nTotal submissions with emails: ${submissions.length}`);

    console.log('\n=== MOST RECENT EMAILS ===');
    const recent = submissions
      .sort((a, b) => {
        const aDate = new Date(a.emailHistory[a.emailHistory.length - 1].sentAt);
        const bDate = new Date(b.emailHistory[b.emailHistory.length - 1].sentAt);
        return bDate - aDate;
      })
      .slice(0, 25);

    recent.forEach(s => {
      const lastEmail = s.emailHistory[s.emailHistory.length - 1];
      console.log(`${s.email} (${s.campaignId})`);
      console.log(`  Sent: ${lastEmail.sentAt}`);
      console.log(`  Type: ${lastEmail.type}, Test: ${lastEmail.testMode}`);
      console.log('');
    });

  } finally {
    await client.close();
  }
}

check().catch(console.error);
