/**
 * Check Subscribers Script
 *
 * This script checks for subscribers in the database
 * Usage: node check-subscribers.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkSubscribers() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    // Check newsletter database
    console.log('📧 Checking newsletter database...');
    const newsletterDb = client.db('newsletter');
    const newsletterSubscribers = await newsletterDb.collection('subscribers').find({}).toArray();
    console.log(`Found ${newsletterSubscribers.length} subscribers in newsletter database`);

    if (newsletterSubscribers.length > 0) {
      console.log('\nFirst 5 subscribers:');
      newsletterSubscribers.slice(0, 5).forEach((sub, index) => {
        console.log(`\n${index + 1}. Email: ${sub.email}`);
        console.log(`   Verified: ${sub.isVerified ? '✅' : '❌'}`);
        console.log(`   Created: ${sub.createdAt}`);
      });
    }

    // Check fargeleggingsapp database
    console.log('\n\n📧 Checking fargeleggingsapp database...');
    const appDb = client.db('fargeleggingsapp');

    // List all collections
    const collections = await appDb.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check if there's a subscribers collection
    if (collections.some(col => col.name === 'subscribers')) {
      const appSubscribers = await appDb.collection('subscribers').find({}).toArray();
      console.log(`\nFound ${appSubscribers.length} subscribers in fargeleggingsapp.subscribers`);

      if (appSubscribers.length > 0) {
        console.log('\nFirst 5 subscribers:');
        appSubscribers.slice(0, 5).forEach((sub, index) => {
          console.log(`\n${index + 1}. Email: ${sub.email}`);
          console.log(`   Verified: ${sub.isVerified ? '✅' : '❌'}`);
          console.log(`   Created: ${sub.createdAt}`);
        });
      }
    }

    // Check newsletter_subscribers collection
    if (collections.some(col => col.name === 'newsletter_subscribers')) {
      const newsletterSubs = await appDb.collection('newsletter_subscribers').find({}).toArray();
      console.log(`\n\nFound ${newsletterSubs.length} subscribers in fargeleggingsapp.newsletter_subscribers`);

      if (newsletterSubs.length > 0) {
        console.log('\nFirst 5 subscribers:');
        newsletterSubs.slice(0, 5).forEach((sub, index) => {
          console.log(`\n${index + 1}. Email: ${sub.email}`);
          console.log(`   Verified: ${sub.isVerified ? '✅' : '❌'}`);
          console.log(`   Created: ${sub.createdAt}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n\n✅ Disconnected from MongoDB');
  }
}

checkSubscribers();
