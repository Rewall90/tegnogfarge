const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const email = 'tutomg@hotmail.com';

    // Check in users collection
    const appDb = client.db('fargeleggingsapp');
    const usersCollection = appDb.collection('users');
    const user = await usersCollection.findOne({ email });

    console.log('👤 USERS COLLECTION (fargeleggingsapp):');
    console.log('='  .repeat(80));
    if (user) {
      console.log('✅ Found user:', email);
      console.log('   Name:', user.name);
      console.log('   Email Verified:', user.emailVerified);
      console.log('   Created:', user.createdAt);
      console.log('   Role:', user.role);
      console.log('   _id:', user._id);
    } else {
      console.log('❌ User NOT found in users collection');
    }

    // Check in newsletter subscribers
    const newsletterDb = client.db('newsletter');
    const newsletterCollection = newsletterDb.collection('subscribers');
    const newsletterSub = await newsletterCollection.findOne({ email });

    console.log('\n📧 NEWSLETTER SUBSCRIBERS COLLECTION:');
    console.log('='  .repeat(80));
    if (newsletterSub) {
      console.log('✅ Found in newsletter:', email);
      console.log('   Subscribed At:', newsletterSub.subscribedAt);
      console.log('   Verified:', newsletterSub.isVerified);
      console.log('   _id:', newsletterSub._id);
    } else {
      console.log('❌ NOT found in newsletter subscribers');
    }

    // Check in lead submissions
    const leadCollection = appDb.collection('lead_submissions');
    const leadSub = await leadCollection.findOne({ email });

    console.log('\n🎯 LEAD SUBMISSIONS COLLECTION:');
    console.log('='  .repeat(80));
    if (leadSub) {
      console.log('✅ Found in lead submissions:', email);
      console.log('   Campaign:', leadSub.campaignId);
      console.log('   Submitted At:', leadSub.submittedAt);
      console.log('   Verified:', leadSub.isVerified);
      console.log('   _id:', leadSub._id);
    } else {
      console.log('❌ NOT found in lead submissions');
    }

    // Check verification tokens
    const tokensCollection = appDb.collection('verification_tokens');
    const tokens = await tokensCollection.find({ email }).sort({ createdAt: -1 }).toArray();

    console.log('\n🔑 VERIFICATION TOKENS:');
    console.log('='  .repeat(80));
    if (tokens.length > 0) {
      console.log(`✅ Found ${tokens.length} verification token(s):`);
      tokens.forEach((t, i) => {
        console.log(`\n   ${i + 1}. Type: ${t.type}`);
        console.log(`      Created: ${t.createdAt}`);
        console.log(`      Expires: ${t.expiresAt}`);
        console.log(`      Used: ${t.used}`);
        console.log(`      Token: ${t.token?.substring(0, 20)}...`);
      });
    } else {
      console.log('❌ No verification tokens found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkUser();
