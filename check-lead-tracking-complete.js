const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkLeadTracking() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const appDb = client.db('fargeleggingsapp');

    // Get all lead submissions
    const submissions = appDb.collection('lead_submissions');
    const allSubmissions = await submissions.find({}).sort({ submittedAt: -1 }).toArray();

    console.log('🎯 LEAD SUBMISSIONS COLLECTION:');
    console.log('='.repeat(80));
    console.log(`Total submissions: ${allSubmissions.length}\n`);

    if (allSubmissions.length > 0) {
      allSubmissions.forEach((sub, i) => {
        console.log(`${i + 1}. ${sub.email}`);
        console.log(`   Campaign: ${sub.campaignId}`);
        console.log(`   Submitted: ${sub.submittedAt}`);
        console.log(`   Verified: ${sub.isVerified}`);
        console.log(`   Verified At: ${sub.verifiedAt || 'Not verified'}`);
        console.log(`   _id: ${sub._id}`);
        console.log('');
      });
    } else {
      console.log('❌ No submissions found\n');
    }

    // Get all verification tokens for lead campaigns
    const tokens = appDb.collection('verification_tokens');
    const leadTokens = await tokens.find({
      type: 'lead_campaign_verification'
    }).sort({ createdAt: -1 }).toArray();

    console.log('\n🔑 LEAD CAMPAIGN VERIFICATION TOKENS:');
    console.log('='.repeat(80));
    console.log(`Total tokens: ${leadTokens.length}\n`);

    leadTokens.forEach((token, i) => {
      console.log(`${i + 1}. ${token.email}`);
      console.log(`   Campaign: ${token.metadata?.campaignId || 'N/A'}`);
      console.log(`   Created: ${token.createdAt}`);
      console.log(`   Expires: ${token.expiresAt}`);
      console.log(`   Used: ${token.used}`);
      console.log(`   Token: ${token.token?.substring(0, 20)}...`);

      // Check if this email has a submission
      const hasSubmission = allSubmissions.find(s => s.email === token.email);
      console.log(`   Has Submission: ${hasSubmission ? '✅ YES' : '❌ NO - MISSING!'}`);
      console.log('');
    });

    // Find tokens without submissions
    console.log('\n⚠️  TOKENS WITHOUT MATCHING SUBMISSIONS:');
    console.log('='.repeat(80));

    const tokensWithoutSubmissions = leadTokens.filter(token =>
      !allSubmissions.find(s => s.email === token.email && s.campaignId === token.metadata?.campaignId)
    );

    console.log(`Found ${tokensWithoutSubmissions.length} tokens without submissions:\n`);

    tokensWithoutSubmissions.forEach((token, i) => {
      console.log(`${i + 1}. ${token.email} (Campaign: ${token.metadata?.campaignId || 'N/A'})`);
      console.log(`   Created: ${token.createdAt}`);
      console.log(`   This submission is MISSING from lead_submissions collection!`);
      console.log('');
    });

    // Check all active campaigns
    console.log('\n📢 ACTIVE LEAD CAMPAIGNS:');
    console.log('='.repeat(80));

    const campaigns = appDb.collection('lead_campaigns');
    const activeCampaigns = await campaigns.find({
      active: true,
      deleted: { $ne: true }
    }).toArray();

    console.log(`Total active campaigns: ${activeCampaigns.length}\n`);

    activeCampaigns.forEach((campaign, i) => {
      const campaignSubmissions = allSubmissions.filter(s => s.campaignId === campaign.campaignId);
      const campaignTokens = leadTokens.filter(t => t.metadata?.campaignId === campaign.campaignId);

      console.log(`${i + 1}. ${campaign.name} (${campaign.campaignId})`);
      console.log(`   Type: ${campaign.type}`);
      console.log(`   Trigger: ${campaign.trigger}`);
      console.log(`   Submissions in DB: ${campaignSubmissions.length}`);
      console.log(`   Verification tokens: ${campaignTokens.length}`);
      console.log(`   Missing: ${campaignTokens.length - campaignSubmissions.length}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkLeadTracking();
