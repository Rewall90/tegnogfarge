// test-db-connection.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Get the connection string from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

console.log('Testing MongoDB connection with updated settings...');

async function testConnection() {
  // Using simplified connection options that match the updated db.ts file
  const options = {
    connectTimeoutMS: 30000,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  };

  const client = new MongoClient(uri, options);

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Try accessing the database
    const db = client.db('fargeleggingsapp');
    
    // List collections
    console.log('Fetching collections...');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check if users collection exists
    const hasUsersCollection = collections.some(c => c.name === 'users');
    console.log('Users collection exists:', hasUsersCollection);
    
    // If users collection exists, try a simple query
    if (hasUsersCollection) {
      const usersCount = await db.collection('users').countDocuments();
      console.log('Number of users in database:', usersCount);
      
      // Try to fetch one user
      const user = await db.collection('users').findOne({});
      if (user) {
        console.log('Example user found (showing only email):', user.email);
      } else {
        console.log('No users found in the database.');
      }
    }
    
    console.log('\nConnection test successful!');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    if (error.cause) console.error('Cause:', error.cause);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection().catch(console.error); 