require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB with simpler options');

async function testMongoConnection() {
  // Much simpler connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');

    const db = client.db('fargeleggingsapp');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Try a simple read operation
    const userCount = await db.collection('users').countDocuments();
    console.log('Number of users in database:', userCount);

  } catch (error) {
    console.error('MongoDB Test Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testMongoConnection().catch(console.error); 