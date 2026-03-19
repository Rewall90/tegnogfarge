/**
 * Create Admin User Script
 *
 * This script creates a new admin user with a known password
 * Usage: node create-admin.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

// CHANGE THESE VALUES
const ADMIN_EMAIL = 'admin@tegnogfarge.no';
const ADMIN_PASSWORD = 'TegnOgFarge2024!'; // Change this to your desired password
const ADMIN_NAME = 'Admin';

async function createAdmin() {
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

    // Check if user already exists
    const existingUser = await users.findOne({ email: ADMIN_EMAIL });

    if (existingUser) {
      console.log(`\n⚠️  User with email ${ADMIN_EMAIL} already exists`);
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      console.log('Email Verified:', existingUser.emailVerified);

      // Ask if they want to update to admin
      if (existingUser.role !== 'admin') {
        console.log('\n📝 Updating user to admin role...');
        await users.updateOne(
          { email: ADMIN_EMAIL },
          {
            $set: {
              role: 'admin',
              emailVerified: true,
              updatedAt: new Date()
            }
          }
        );
        console.log('✅ User updated to admin role');
      } else {
        console.log('✅ User is already an admin');
      }

      console.log('\n⚠️  Password was NOT changed. If you need to reset the password, delete the user first.');
      return;
    }

    // Hash the password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create new admin user
    console.log('👤 Creating admin user...');
    const result = await users.insertOne({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Login at: https://tegnogfarge.no/login');
    console.log('\n⚠️  IMPORTANT: Change your password after first login!');
    console.log('⚠️  Delete this script or change the credentials to prevent security issues.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createAdmin();
