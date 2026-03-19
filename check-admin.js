/**
 * Check Admin User Script
 *
 * This script checks for admin users in the database
 * Usage: node check-admin.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAdmin() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('fargeleggingsapp');
    const users = db.collection('users');

    // Find all admin users
    const adminUsers = await users.find({ role: 'admin' }).toArray();

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found in the database');
      console.log('\nYou need to create an admin user. Options:');
      console.log('1. Register a new user at https://tegnogfarge.no/register');
      console.log('2. Verify the email');
      console.log('3. Manually update the user role to "admin" in MongoDB');
      console.log('\nOr use the create-admin.js script to create one automatically.');
    } else {
      console.log(`\n✅ Found ${adminUsers.length} admin user(s):\n`);
      adminUsers.forEach((user, index) => {
        console.log(`Admin User #${index + 1}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`  Created: ${user.createdAt || 'N/A'}`);
        console.log(`  Password Hash: ${user.password ? 'Set (encrypted)' : 'Not set'}`);
        console.log('');
      });

      console.log('⚠️  NOTE: Passwords are encrypted with bcrypt and cannot be displayed.');
      console.log('If you forgot the password, you can:');
      console.log('1. Use the password reset feature (if implemented)');
      console.log('2. Delete the user and create a new one with create-admin.js');
      console.log('3. Manually update the password hash in MongoDB');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkAdmin();
