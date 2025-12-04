/**
 * Add Photo-to-Coloring Campaign to MongoDB
 *
 * This script adds the new AI photo-to-coloring campaign for A/B testing.
 *
 * Usage:
 *   node scripts/add-photo-coloring-campaign.js
 *
 * The campaign will be set to 10% weight (10% of users see this popup)
 * while the existing campaign keeps weight 9 (90% of users).
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env.local');
  process.exit(1);
}

async function addPhotoColoringCampaign() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('lead_campaigns');

    // Check if campaign already exists
    const existing = await collection.findOne({ campaignId: 'photo-to-coloring-test' });
    if (existing) {
      console.log('Campaign already exists:', existing.campaignId);
      console.log('Current weight:', existing.weight);
      console.log('Active:', existing.active);
      return;
    }

    // New photo-to-coloring campaign
    const newCampaign = {
      campaignId: 'photo-to-coloring-test',
      name: 'Photo to Coloring AI Test',
      type: 'photo_to_coloring',
      active: true,
      trigger: {
        event: 'pdf_downloaded',
        threshold: 3, // Show on 3rd download (same as existing)
      },
      content: {
        // These are not used by PhotoColoringPopup (it has its own UI)
        // but we include them for consistency
        headline: 'Lag fargeleggingsbilde av ditt eget bilde!',
        description: 'Last opp et bilde, og vi gjor det om til en fargeleggingstegning',
        ctaText: 'Last opp bilde',
        dismissText: 'Nei takk',
        thankYouHeadline: 'Takk!',
        thankYouDescription: 'Vi sender deg gratis fargeleggingsbilder.',
        thankYouButtonText: 'Lukk',
      },
      styling: {
        buttonPulse: false,
      },
      weight: 1, // 10% of traffic (existing campaign has weight 9)
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert new campaign
    const result = await collection.insertOne(newCampaign);
    console.log('Inserted new campaign:', result.insertedId);

    // Update existing campaign weight for 90/10 split
    const updateResult = await collection.updateOne(
      { campaignId: 'third-download-gate' },
      { $set: { weight: 9, updatedAt: new Date() } }
    );
    console.log('Updated existing campaign weight:', updateResult.modifiedCount);

    // List all campaigns
    console.log('\nAll active campaigns:');
    const allCampaigns = await collection.find({ active: true, deleted: { $ne: true } }).toArray();
    const totalWeight = allCampaigns.reduce((sum, c) => sum + (c.weight || 1), 0);

    allCampaigns.forEach(c => {
      const percentage = ((c.weight || 1) / totalWeight * 100).toFixed(1);
      console.log(`  - ${c.name}: weight ${c.weight} (${percentage}%)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

addPhotoColoringCampaign();
