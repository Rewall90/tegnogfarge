require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

async function testMongoDB() {
  console.log('Testing MongoDB connection...');
  
  // Check environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    console.log('Please set your MongoDB connection string in .env.local file.');
    return;
  }
  
  console.log('MONGODB_URI:', uri.substring(0, 20) + '...' + ' (showing partial for security)');
  
  // Create MongoDB client with SSL options
  const options = {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  
  const client = new MongoClient(uri, options);
  
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✓ Successfully connected to MongoDB');
    
    // Test database access
    const db = client.db('fargeleggingsapp');
    console.log('✓ Accessed database "fargeleggingsapp"');
    
    // Test verification_tokens collection
    const collection = db.collection('verification_tokens');
    console.log('✓ Accessed collection "verification_tokens"');
    
    // Create a test token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const testToken = {
      email: 'test@example.com',
      token,
      type: 'test',
      expiresAt,
      used: false,
      createdAt: new Date()
    };
    
    // Insert test token
    console.log('Inserting test verification token...');
    const insertResult = await collection.insertOne(testToken);
    console.log('✓ Inserted test token:', insertResult.insertedId);
    
    // Find the test token
    console.log('Finding the test token...');
    const foundToken = await collection.findOne({ token });
    console.log('✓ Found test token:', foundToken ? 'Yes' : 'No');
    
    if (foundToken) {
      console.log('  Token details:');
      console.log(`  - ID: ${foundToken._id}`);
      console.log(`  - Email: ${foundToken.email}`);
      console.log(`  - Type: ${foundToken.type}`);
      console.log(`  - Expires: ${foundToken.expiresAt}`);
    }
    
    // Delete the test token
    console.log('Deleting test token...');
    const deleteResult = await collection.deleteOne({ token });
    console.log('✓ Deleted test token:', deleteResult.deletedCount);
    
    // Test newsletter database
    const newsletterDb = client.db('newsletter');
    console.log('✓ Accessed database "newsletter"');
    
    const subscribersCollection = newsletterDb.collection('subscribers');
    console.log('✓ Accessed collection "subscribers"');
    
    console.log('\n✅ MongoDB is configured correctly!');
    console.log('\nYou can now run the application and the email verification system should work.');
  } catch (error) {
    console.error('\n❌ MongoDB test failed:');
    console.error(error.name + ':', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\nConnection error: Could not connect to MongoDB server.');
      console.error('Please check your connection string and make sure:');
      console.error('1. The hostname is correct');
      console.error('2. The MongoDB server is running');
      console.error('3. Network/firewall allows the connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\nConnection timeout: The MongoDB server did not respond in time.');
      console.error('Please check your connection string and make sure:');
      console.error('1. The MongoDB server is running');
      console.error('2. Network/firewall allows the connection');
    } else if (error.code === 'AuthenticationFailed') {
      console.error('\nAuthentication failed: Username or password is incorrect.');
      console.error('Please check your MongoDB connection string username and password.');
    }
    
    console.error('\nFull error details:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testMongoDB(); 