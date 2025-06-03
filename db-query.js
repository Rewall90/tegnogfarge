const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection URI from .env file
const uri = process.env.MONGODB_URI;

// Create a new MongoClient with standard options
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB server');

    // Get the database and collection
    const database = client.db();
    const collection = database.collection('users');

    // Find all documents in the collection
    const cursor = collection.find({});
    const documents = await cursor.toArray();
    
    console.log('Found documents:');
    console.log(JSON.stringify(documents, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Database connection closed');
  }
}

run(); 