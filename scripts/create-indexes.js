const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI er ikke definert i miljøvariablene');
    process.exit(1);
  }

  console.log('Using MongoDB URI:', uri.substring(0, 15) + '...');

  const client = new MongoClient(uri);

  try {
    console.log('Kobler til MongoDB...');
    await client.connect();
    console.log('Koblet til MongoDB');

    // Users collection indexes
    const usersDb = client.db('fargeleggingsapp');
    await usersDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await usersDb.collection('users').createIndex({ emailVerified: 1 });
    await usersDb.collection('users').createIndex({ createdAt: -1 });
    console.log('Opprettet indekser for users-collection');

    // Verification tokens indexes
    await usersDb.collection('verification_tokens').createIndex({ token: 1 }, { unique: true });
    await usersDb.collection('verification_tokens').createIndex({ email: 1 });
    await usersDb.collection('verification_tokens').createIndex({ type: 1 });
    await usersDb.collection('verification_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await usersDb.collection('verification_tokens').createIndex({ createdAt: -1 });
    console.log('Opprettet indekser for verification_tokens-collection');

    // Newsletter subscribers indexes
    const newsletterDb = client.db('newsletter');
    await newsletterDb.collection('subscribers').createIndex({ email: 1 }, { unique: true });
    await newsletterDb.collection('subscribers').createIndex({ isVerified: 1 });
    await newsletterDb.collection('subscribers').createIndex({ subscribedAt: -1 });
    await newsletterDb.collection('subscribers').createIndex({ unsubscribeToken: 1 }, { sparse: true });
    console.log('Opprettet indekser for newsletter subscribers-collection');

    console.log('Alle indekser opprettet');
  } catch (error) {
    console.error('Feil ved oppretting av indekser:', error);
  } finally {
    await client.close();
    console.log('Databasetilkobling lukket');
  }
}

createIndexes().catch(error => {
  console.error('Uventet feil:', error);
}); 