/**
 * Reset Campaigns for Production
 *
 * This script:
 * 1. Resets all active campaigns to weight 1 (equal 25% each)
 * 2. Resets threshold back to 3 (trigger on 3rd download)
 *
 * Usage:
 *   node scripts/reset-campaigns-production.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env.local');
  process.exit(1);
}

async function resetCampaignsProduction() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db();
    const collection = db.collection('lead_campaigns');

    // Step 1: Reset all active campaigns to weight 1 and threshold 3
    console.log('=== Resetting All Active Campaigns ===');
    const resetResult = await collection.updateMany(
      {
        active: true,
        deleted: { $ne: true },
        'trigger.event': 'pdf_downloaded',
      },
      {
        $set: {
          weight: 1,
          'trigger.threshold': 3,
          updatedAt: new Date(),
        }
      }
    );
    console.log(`Reset ${resetResult.modifiedCount} campaign(s) to weight=1, threshold=3\n`);

    // Step 2: Show final state
    console.log('=== Final Campaign Setup ===');
    const activeCampaigns = await collection.find({
      active: true,
      deleted: { $ne: true },
      'trigger.event': 'pdf_downloaded',
    }).toArray();

    const totalWeight = activeCampaigns.reduce((sum, c) => sum + (c.weight || 1), 0);
    console.log(`Total active campaigns: ${activeCampaigns.length}`);
    console.log(`Total weight: ${totalWeight}\n`);

    activeCampaigns.forEach(c => {
      const percentage = ((c.weight || 1) / totalWeight * 100).toFixed(1);
      console.log(`  - ${c.name}`);
      console.log(`    ID: ${c.campaignId}`);
      console.log(`    Type: ${c.type}`);
      console.log(`    Weight: ${c.weight} (${percentage}%)`);
      console.log(`    Threshold: ${c.trigger.threshold}`);
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

resetCampaignsProduction();
