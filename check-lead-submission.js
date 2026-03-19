const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkLeadSubmission() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('fargeleggingsapp');

  // Check lead_submissions collection
  const submissions = await db.collection('lead_submissions').find({
    email: 'hei@test.no'
  }).toArray();

  console.log('\n=== Lead Submissions for hei@test.no ===');
  console.log(JSON.stringify(submissions, null, 2));

  // Check verification tokens
  const tokens = await db.collection('verification_tokens').find({
    email: 'hei@test.no',
    type: 'lead_campaign_verification'
  }).sort({ createdAt: -1 }).limit(1).toArray();

  console.log('\n=== Verification Tokens ===');
  console.log(JSON.stringify(tokens, null, 2));

  await client.close();
}

checkLeadSubmission().catch(console.error);
