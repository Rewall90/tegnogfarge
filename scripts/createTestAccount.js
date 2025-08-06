const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

async function createTestAccount() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fargeleggingsapp');
    const usersCollection = db.collection('users');
    
    // Test account details
    const testEmail = 'test@tegnogfarge.no';
    const testPassword = 'TestKonto2025!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Check if test account already exists
    const existingUser = await usersCollection.findOne({ email: testEmail });
    
    if (existingUser) {
      console.log('Test account already exists. Updating password...');
      await usersCollection.updateOne(
        { email: testEmail },
        {
          $set: {
            password: hashedPassword,
            emailVerified: true,
            updatedAt: new Date()
          }
        }
      );
    } else {
      console.log('Creating new test account...');
      await usersCollection.insertOne({
        email: testEmail,
        password: hashedPassword,
        name: 'Test Bruker',
        emailVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('✅ Test account created/updated successfully!');
    console.log('');
    console.log('Test Account Credentials:');
    console.log('------------------------');
    console.log('Email: test@tegnogfarge.no');
    console.log('Password: TestKonto2025!');
    console.log('');
    console.log('You can share these credentials with webmasters for testing.');
    
  } catch (error) {
    console.error('Error creating test account:', error);
  } finally {
    await client.close();
  }
}

createTestAccount();