import { MongoClient, Document } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Connection URI from .env file
const uri = process.env.MONGODB_URI as string;

// Create a new MongoClient with standard options
const client = new MongoClient(uri);

// Define the error interface for better typing
interface MongoDBError extends Error {
  code?: string;
  statusCode?: number;
}

async function run(): Promise<void> {
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
  } catch (error: unknown) {
    const typedError = error as MongoDBError;
    console.error('Error:', typedError);
  } finally {
    // Close the connection
    await client.close();
    console.log('Database connection closed');
  }
}

run(); 