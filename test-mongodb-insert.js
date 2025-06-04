// test-mongodb-insert.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

console.log('Connecting to MongoDB:', uri.startsWith('mongodb+srv://') ? 'SRV connection' : 'Standard connection');

async function testMongoConnection() {
  // Basisalternativer som fungerer med både standard og SRV tilkoblinger
  const baseOptions = {
    connectTimeoutMS: 10000, // 10 sekunder
    socketTimeoutMS: 45000,  // 45 sekunder
  };

  // Legg til alternativer basert på URI-type
  const options = {
    ...baseOptions,
    ...(uri.startsWith('mongodb+srv://') 
      ? {
          // SRV-spesifikke alternativer
          ssl: true,
          tls: true,
        } 
      : {
          // Standard tilkoblings-alternativer
          ssl: true,
          tls: true,
          tlsAllowInvalidCertificates: true,
          tlsAllowInvalidHostnames: true,
          directConnection: true,
        }
    )
  };

  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');

    const db = client.db('fargeleggingsapp');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Try to insert a test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password_would_go_here',
      role: 'user',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteIds: []
    };
    
    console.log('Attempting to insert test user...');
    const result = await db.collection('users').insertOne(testUser);
    console.log('Insert result:', result);
    
    if (result.acknowledged) {
      console.log('Test user inserted successfully with ID:', result.insertedId);
      
      // Verify the user was created by reading it back
      const savedUser = await db.collection('users').findOne({ _id: result.insertedId });
      console.log('Retrieved test user:', savedUser ? 'Found' : 'Not found');
      
      // Clean up test data
      console.log('Cleaning up test data...');
      await db.collection('users').deleteOne({ _id: result.insertedId });
    } else {
      console.error('Failed to insert test user');
    }

  } catch (error) {
    console.error('MongoDB Test Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testMongoConnection().catch(console.error); 