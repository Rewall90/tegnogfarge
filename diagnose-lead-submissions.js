const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const appDb = client.db('fargeleggingsapp');

    // Check lead_submissions collection
    console.log('🔍 CHECKING lead_submissions COLLECTION:');
    console.log('=' .repeat(80));

    const submissions = appDb.collection('lead_submissions');

    // Get all documents
    const allSubmissions = await submissions.find({}).toArray();
    console.log(`\nTotal documents: ${allSubmissions.length}`);

    if (allSubmissions.length > 0) {
      console.log('\n📄 ALL SUBMISSIONS:');
      allSubmissions.forEach((sub, i) => {
        console.log(`\n${i + 1}. ${sub.email}`);
        console.log(`   Campaign: ${sub.campaignId}`);
        console.log(`   Submitted: ${sub.submittedAt}`);
        console.log(`   Verified: ${sub.isVerified}`);
        console.log(`   _id: ${sub._id}`);
      });
    }

    // Check for unverified submissions
    const unverified = await submissions.find({ isVerified: false }).toArray();
    console.log(`\n⏳ Unverified submissions: ${unverified.length}`);

    // Check for verified submissions
    const verified = await submissions.find({ isVerified: true }).toArray();
    console.log(`✅ Verified submissions: ${verified.length}`);

    // Check for unsubscribed
    const unsubscribed = await submissions.find({ unsubscribedAt: { $ne: null } }).toArray();
    console.log(`❌ Unsubscribed: ${unsubscribed.length}`);

    // Check verification_tokens for lead campaigns
    console.log('\n\n🔑 CHECKING verification_tokens:');
    console.log('=' .repeat(80));

    const tokens = appDb.collection('verification_tokens');
    const leadTokens = await tokens.find({ type: 'lead_campaign_verification' }).sort({ createdAt: -1 }).limit(10).toArray();

    console.log(`\nTotal lead campaign tokens: ${await tokens.countDocuments({ type: 'lead_campaign_verification' })}`);
    console.log(`\nMost recent 10 tokens:`);

    leadTokens.forEach((t, i) => {
      console.log(`\n${i + 1}. Email: ${t.email}`);
      console.log(`   Campaign: ${t.metadata?.campaignId || 'N/A'}`);
      console.log(`   Created: ${t.createdAt}`);
      console.log(`   Expires: ${t.expiresAt}`);
      console.log(`   Used: ${t.used}`);
      console.log(`   Token (first 20): ${t.token?.substring(0, 20)}...`);
    });

    // Check lead_campaigns collection
    console.log('\n\n📢 CHECKING lead_campaigns COLLECTION:');
    console.log('=' .repeat(80));

    const campaigns = appDb.collection('lead_campaigns');
    const allCampaigns = await campaigns.find({ deleted: { $ne: true } }).toArray();

    console.log(`\nTotal active campaigns: ${allCampaigns.length}`);

    allCampaigns.forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.name} (${c.campaignId})`);
      console.log(`   Active: ${c.active}`);
      console.log(`   Type: ${c.type}`);
      console.log(`   Created: ${c.createdAt || 'N/A'}`);
    });

    // Check database stats
    console.log('\n\n📊 DATABASE STATS:');
    console.log('=' .repeat(80));

    const stats = await appDb.stats();
    console.log(`\nDatabase: ${stats.db}`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

diagnose();
