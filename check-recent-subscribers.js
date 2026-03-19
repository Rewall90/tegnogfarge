const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRecentSubscribers() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    // Check newsletter subscribers
    const newsletterDb = client.db('newsletter');
    const newsletterSubscribers = await newsletterDb
      .collection('subscribers')
      .find({})
      .sort({ subscribedAt: -1 })
      .limit(5)
      .toArray();

    console.log('📧 NEWSLETTER - Most recent 5 subscribers:');
    newsletterSubscribers.forEach((sub, i) => {
      console.log(`${i + 1}. ${sub.email}`);
      console.log(`   subscribedAt: ${sub.subscribedAt}`);
      console.log(`   subscribedAt type: ${typeof sub.subscribedAt}`);
      console.log(`   isVerified: ${sub.isVerified}`);
      console.log('');
    });

    // Check total count
    const totalNewsletter = await newsletterDb.collection('subscribers').countDocuments({});
    console.log(`Total newsletter subscribers: ${totalNewsletter}\n`);

    console.log('---\n');

    // Check lead campaign submissions
    const appDb = client.db('fargeleggingsapp');
    const leadSubmissions = await appDb
      .collection('lead_submissions')
      .find({})
      .sort({ submittedAt: -1 })
      .limit(5)
      .toArray();

    console.log('🎯 LEAD CAMPAIGNS - Most recent 5 submissions:');
    if (leadSubmissions.length === 0) {
      console.log('No lead submissions found');
    } else {
      leadSubmissions.forEach((sub, i) => {
        console.log(`${i + 1}. ${sub.email}`);
        console.log(`   submittedAt: ${sub.submittedAt}`);
        console.log(`   submittedAt type: ${typeof sub.submittedAt}`);
        console.log(`   campaignId: ${sub.campaignId}`);
        console.log(`   isVerified: ${sub.isVerified}`);
        console.log('');
      });
    }

    // Check total count
    const totalLeads = await appDb.collection('lead_submissions').countDocuments({});
    console.log(`Total lead submissions: ${totalLeads}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkRecentSubscribers();
