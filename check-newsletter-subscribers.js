const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkNewsletterSubscribers() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('newsletter');

  const subscribers = await db.collection('subscribers').find({}).limit(10).toArray();

  console.log('\n=== Newsletter Subscribers ===');
  console.log('Total count:', await db.collection('subscribers').countDocuments({}));
  console.log('\nFirst 10 subscribers:');
  console.log(JSON.stringify(subscribers, null, 2));

  await client.close();
}

checkNewsletterSubscribers().catch(console.error);
