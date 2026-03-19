const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkCampaigns() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('fargeleggingsapp');

  const campaigns = await db.collection('lead_campaigns').find({
    deleted: { $ne: true }
  }).toArray();

  console.log('Active Lead Campaigns:', campaigns.length);
  console.log(JSON.stringify(campaigns, null, 2));

  await client.close();
}

checkCampaigns().catch(console.error);
