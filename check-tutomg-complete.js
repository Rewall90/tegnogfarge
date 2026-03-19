const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkTutomgUser() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const email = 'tutomg@hotmail.com';
    const appDb = client.db('fargeleggingsapp');

    console.log(`🔍 COMPLETE CHECK FOR: ${email}`);
    console.log('='.repeat(80));

    // 1. Check users collection
    const usersCollection = appDb.collection('users');
    const user = await usersCollection.findOne({ email });

    console.log('\n👤 USERS COLLECTION:');
    if (user) {
      console.log('✅ Found user');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log(`   _id: ${user._id}`);
    } else {
      console.log('❌ NOT found in users collection');
    }

    // 2. Check verification tokens
    const tokensCollection = appDb.collection('verification_tokens');
    const allTokens = await tokensCollection.find({ email }).sort({ createdAt: -1 }).toArray();

    console.log('\n🔑 VERIFICATION TOKENS:');
    console.log(`Total tokens: ${allTokens.length}`);

    if (allTokens.length > 0) {
      allTokens.forEach((token, i) => {
        console.log(`\n${i + 1}. Type: ${token.type}`);
        console.log(`   Created: ${token.createdAt}`);
        console.log(`   Expires: ${token.expiresAt}`);
        console.log(`   Used: ${token.used}`);
        console.log(`   Token: ${token.token?.substring(0, 20)}...`);
        if (token.metadata) {
          console.log(`   Metadata:`, JSON.stringify(token.metadata, null, 6));
        }
      });
    } else {
      console.log('❌ No verification tokens found');
    }

    // 3. Check lead submissions
    const submissionsCollection = appDb.collection('lead_submissions');
    const submissions = await submissionsCollection.find({ email }).sort({ submittedAt: -1 }).toArray();

    console.log('\n🎯 LEAD SUBMISSIONS:');
    console.log(`Total submissions: ${submissions.length}`);

    if (submissions.length > 0) {
      submissions.forEach((sub, i) => {
        console.log(`\n${i + 1}. Campaign: ${sub.campaignId}`);
        console.log(`   Submitted: ${sub.submittedAt}`);
        console.log(`   Verified: ${sub.isVerified}`);
        console.log(`   Verified At: ${sub.verifiedAt || 'Not verified'}`);
        console.log(`   Unsubscribed: ${sub.unsubscribedAt || 'No'}`);
        console.log(`   _id: ${sub._id}`);
        if (sub.metadata) {
          console.log(`   Metadata:`, JSON.stringify(sub.metadata, null, 6));
        }
      });
    } else {
      console.log('❌ No lead submissions found');
    }

    // 4. Check newsletter subscribers
    const newsletterDb = client.db('newsletter');
    const newsletterCollection = newsletterDb.collection('subscribers');
    const newsletterSub = await newsletterCollection.findOne({ email });

    console.log('\n📧 NEWSLETTER SUBSCRIBERS:');
    if (newsletterSub) {
      console.log('✅ Found in newsletter');
      console.log(`   Subscribed At: ${newsletterSub.subscribedAt}`);
      console.log(`   Verified: ${newsletterSub.isVerified}`);
      console.log(`   _id: ${newsletterSub._id}`);
    } else {
      console.log('❌ NOT found in newsletter');
    }

    // 5. Timeline summary
    console.log('\n📅 TIMELINE SUMMARY:');
    console.log('='.repeat(80));

    const events = [];

    if (user) {
      events.push({
        time: new Date(user.createdAt),
        event: 'User Registration',
        details: `Created user account (verified: ${user.emailVerified})`
      });
    }

    allTokens.forEach(token => {
      events.push({
        time: new Date(token.createdAt),
        event: `Verification Token (${token.type})`,
        details: `Used: ${token.used}, Campaign: ${token.metadata?.campaignId || 'N/A'}`
      });
    });

    submissions.forEach(sub => {
      events.push({
        time: new Date(sub.submittedAt),
        event: 'Lead Submission',
        details: `Campaign: ${sub.campaignId}, Verified: ${sub.isVerified}`
      });
    });

    if (newsletterSub) {
      events.push({
        time: new Date(newsletterSub.subscribedAt),
        event: 'Newsletter Subscription',
        details: `Verified: ${newsletterSub.isVerified}`
      });
    }

    // Sort by time
    events.sort((a, b) => a.time - b.time);

    events.forEach((evt, i) => {
      console.log(`\n${i + 1}. ${evt.time.toISOString()} - ${evt.event}`);
      console.log(`   ${evt.details}`);
    });

    console.log('\n\n🎯 CONCLUSION:');
    console.log('='.repeat(80));

    if (user && !submissions.length) {
      console.log('This email was used for USER REGISTRATION, not a lead campaign submission.');
      console.log('The verification email would have said "Velkommen til TegnOgFarge.no!"');
    } else if (submissions.length > 0) {
      console.log('This email has both user registration AND lead campaign submissions.');
    } else if (!user && submissions.length > 0) {
      console.log('This email was only used for lead campaign submissions (no user account).');
    } else {
      console.log('This email has not been used in any way in the system.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkTutomgUser();
