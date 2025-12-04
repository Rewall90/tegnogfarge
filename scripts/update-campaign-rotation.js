/**
 * Update Campaign Rotation
 *
 * This script:
 * 1. Deactivates "Continuous Supply Positioning (Kopi)" campaign
 * 2. Sets all remaining campaigns to equal weight (25% each)
 * 3. Ensures photo-to-coloring-test has pdf_downloaded trigger at threshold 3
 *
 * Usage:
 *   node scripts/update-campaign-rotation.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env.local');
  process.exit(1);
}

async function updateCampaignRotation() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db();
    const collection = db.collection('lead_campaigns');

    // Step 1: Show current state
    console.log('=== Current Campaigns ===');
    const allCampaigns = await collection.find({ deleted: { $ne: true } }).toArray();
    allCampaigns.forEach(c => {
      console.log(`  - ${c.name}`);
      console.log(`    ID: ${c.campaignId}`);
      console.log(`    Active: ${c.active}`);
      console.log(`    Weight: ${c.weight}`);
      console.log(`    Trigger: ${c.trigger.event} at threshold ${c.trigger.threshold}`);
      console.log('');
    });

    // Step 2: Deactivate "Continuous Supply Positioning (Kopi)"
    console.log('=== Deactivating Copy Campaign ===');
    const deactivateResult = await collection.updateMany(
      {
        $or: [
          { name: { $regex: /kopi/i } },
          { campaignId: { $regex: /copy/i } },
        ]
      },
      {
        $set: {
          active: false,
          updatedAt: new Date(),
        }
      }
    );
    console.log(`Deactivated ${deactivateResult.modifiedCount} campaign(s)\n`);

    // Step 3: Update photo-to-coloring-test to have correct trigger
    console.log('=== Updating photo-to-coloring-test ===');
    const photoResult = await collection.updateOne(
      { campaignId: 'photo-to-coloring-test' },
      {
        $set: {
          active: true,
          trigger: {
            event: 'pdf_downloaded',
            threshold: 3,
          },
          weight: 1,
          updatedAt: new Date(),
        }
      }
    );
    console.log(`Updated photo-to-coloring-test: ${photoResult.modifiedCount} modified\n`);

    // Step 4: Set all active campaigns to weight 1 (equal rotation)
    console.log('=== Setting Equal Weights ===');
    const weightResult = await collection.updateMany(
      {
        active: true,
        deleted: { $ne: true },
        'trigger.event': 'pdf_downloaded',
        'trigger.threshold': 3,
      },
      {
        $set: {
          weight: 1,
          updatedAt: new Date(),
        }
      }
    );
    console.log(`Set weight to 1 for ${weightResult.modifiedCount} campaign(s)\n`);

    // Step 5: Show final state
    console.log('=== Final Campaign Setup ===');
    const activeCampaigns = await collection.find({
      active: true,
      deleted: { $ne: true },
      'trigger.event': 'pdf_downloaded',
      'trigger.threshold': 3,
    }).toArray();

    const totalWeight = activeCampaigns.reduce((sum, c) => sum + (c.weight || 1), 0);
    console.log(`Total active campaigns at threshold 3: ${activeCampaigns.length}`);
    console.log(`Total weight: ${totalWeight}\n`);

    activeCampaigns.forEach(c => {
      const percentage = ((c.weight || 1) / totalWeight * 100).toFixed(1);
      console.log(`  - ${c.name}`);
      console.log(`    ID: ${c.campaignId}`);
      console.log(`    Type: ${c.type}`);
      console.log(`    Weight: ${c.weight} (${percentage}%)`);
      console.log('');
    });

    console.log('=== Done ===');
    console.log('All campaigns now rotate equally at 3rd download.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateCampaignRotation();
