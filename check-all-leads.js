const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAllLeads() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const appDb = client.db('fargeleggingsapp');
    const collection = appDb.collection('lead_submissions');

    // Get all lead submissions sorted by date (newest first)
    const allSubmissions = await collection
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    console.log(`🎯 TOTAL LEAD SUBMISSIONS: ${allSubmissions.length}\n`);
    console.log('='  .repeat(80));

    if (allSubmissions.length === 0) {
      console.log('❌ No lead submissions found in database');
    } else {
      allSubmissions.forEach((sub, i) => {
        console.log(`\n${i + 1}. Email: ${sub.email}`);
        console.log(`   Campaign: ${sub.campaignId}`);
        console.log(`   Campaign Name: ${sub.metadata?.campaignName || 'N/A'}`);
        console.log(`   Submitted: ${sub.submittedAt}`);
        console.log(`   Submitted (ISO): ${sub.submittedAt?.toISOString?.() || 'N/A'}`);
        console.log(`   Verified: ${sub.isVerified}`);
        console.log(`   Verified At: ${sub.verifiedAt || 'Not verified'}`);
        console.log(`   Unsubscribed: ${sub.unsubscribedAt || 'No'}`);
        console.log(`   Downloads: ${sub.metadata?.downloadCount || 0}`);
      });

      console.log('\n' + '='.repeat(80));

      // Group by campaign
      const byCampaign = {};
      allSubmissions.forEach(sub => {
        const campaign = sub.campaignId || 'Unknown';
        if (!byCampaign[campaign]) {
          byCampaign[campaign] = [];
        }
        byCampaign[campaign].push(sub);
      });

      console.log('\n📊 SUBMISSIONS BY CAMPAIGN:');
      Object.keys(byCampaign).forEach(campaign => {
        console.log(`\n   ${campaign}: ${byCampaign[campaign].length} submissions`);
      });

      // Check for date issues
      console.log('\n' + '='.repeat(80));
      console.log('\n📅 DATE ANALYSIS:');
      const now = new Date();
      const futureDates = allSubmissions.filter(sub => new Date(sub.submittedAt) > now);
      const nullDates = allSubmissions.filter(sub => !sub.submittedAt);

      console.log(`   Current date: ${now.toISOString()}`);
      console.log(`   Future dates: ${futureDates.length}`);
      console.log(`   Null/missing dates: ${nullDates.length}`);

      if (allSubmissions.length > 0) {
        const dates = allSubmissions.map(s => new Date(s.submittedAt)).sort((a, b) => b - a);
        console.log(`   Newest: ${dates[0]?.toISOString?.()}`);
        console.log(`   Oldest: ${dates[dates.length - 1]?.toISOString?.()}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAllLeads();
