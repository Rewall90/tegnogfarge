const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    console.log('=== CAMPAIGNS IN lead_campaigns COLLECTION ===');
    const allCampaigns = await db.collection('lead_campaigns').find({}).toArray();
    console.log('Total campaigns:', allCampaigns.length);

    allCampaigns.forEach(c => {
      console.log(`- ${c.campaignId} (deleted: ${c.deleted || false}, active: ${c.active})`);
    });

    console.log('\n=== NON-DELETED CAMPAIGNS (what API returns) ===');
    const nonDeleted = await db.collection('lead_campaigns')
      .find({ deleted: { $ne: true } })
      .toArray();
    console.log('Non-deleted count:', nonDeleted.length);
    nonDeleted.forEach(c => console.log(`- ${c.campaignId}`));

    console.log('\n=== CAMPAIGNS WITH EMAIL HISTORY ===');
    const submissions = await db.collection('lead_submissions')
      .find({ 'emailHistory.0': { $exists: true } })
      .toArray();

    const campaignsWithEmails = new Set(submissions.map(s => s.campaignId));
    console.log('Campaigns that have sent emails:');
    campaignsWithEmails.forEach(id => {
      const count = submissions.filter(s => s.campaignId === id).length;
      const isInCollection = allCampaigns.some(c => c.campaignId === id);
      const isDeleted = allCampaigns.find(c => c.campaignId === id)?.deleted;
      console.log(`- ${id}: ${count} emails sent (in collection: ${isInCollection}, deleted: ${isDeleted || false})`);
    });

    console.log('\n=== MISMATCH ANALYSIS ===');
    campaignsWithEmails.forEach(id => {
      if (!nonDeleted.some(c => c.campaignId === id)) {
        console.log(`⚠️  Campaign "${id}" has sent emails but won't appear in dropdown!`);
        const campaign = allCampaigns.find(c => c.campaignId === id);
        if (!campaign) {
          console.log(`   Reason: Not in lead_campaigns collection`);
        } else if (campaign.deleted) {
          console.log(`   Reason: Marked as deleted`);
        }
      }
    });

  } finally {
    await client.close();
  }
}

check().catch(console.error);
