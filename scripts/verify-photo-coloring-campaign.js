/**
 * Verify Photo-to-Coloring Campaign in MongoDB
 *
 * Quick check to see that the campaign was created and will display properly in dashboard.
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env.local');
  process.exit(1);
}

async function verifyCampaign() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db();

    // Check campaign collection
    const campaignsCollection = db.collection('lead_campaigns');
    const campaign = await campaignsCollection.findOne({ campaignId: 'photo-to-coloring-test' });

    if (!campaign) {
      console.log('ERROR: Campaign not found!');
      return;
    }

    console.log('=== Campaign Found ===');
    console.log('Campaign ID:', campaign.campaignId);
    console.log('Name:', campaign.name);
    console.log('Type:', campaign.type);
    console.log('Active:', campaign.active);
    console.log('Weight:', campaign.weight);
    console.log('Trigger Event:', campaign.trigger.event);
    console.log('Trigger Threshold:', campaign.trigger.threshold);
    console.log('Created At:', campaign.createdAt);

    // Check stats collection
    console.log('\n=== Stats Collection ===');
    const statsCollection = db.collection('lead_campaign_stats');
    const stats = await statsCollection.findOne({ campaignId: 'photo-to-coloring-test' });

    if (stats) {
      console.log('Stats found:');
      console.log('  Shown Count:', stats.shownCount || 0);
      console.log('  Submitted Count:', stats.submittedCount || 0);
      console.log('  Dismissed Count:', stats.dismissedCount || 0);
    } else {
      console.log('No stats yet (will be created when first tracking event occurs)');
      console.log('Stats are stored in the lead_campaign_stats collection');
    }

    // List all campaigns to show the full picture
    console.log('\n=== All Active Campaigns ===');
    const allCampaigns = await campaignsCollection.find({
      active: true,
      deleted: { $ne: true }
    }).toArray();

    const totalWeight = allCampaigns.reduce((sum, c) => sum + (c.weight || 1), 0);

    allCampaigns.forEach(c => {
      const percentage = ((c.weight || 1) / totalWeight * 100).toFixed(1);
      const typeIndicator = c.type === 'photo_to_coloring' ? ' [AI Photo]' : '';
      console.log(`  - ${c.name}${typeIndicator}`);
      console.log(`    Type: ${c.type}, Weight: ${c.weight} (${percentage}%)`);
      console.log(`    Trigger: ${c.trigger.event} at threshold ${c.trigger.threshold}`);
    });

    console.log('\n=== Dashboard Display Info ===');
    console.log('The campaign should now appear in: /dashboard/campaigns');
    console.log('Stats columns will show:');
    console.log('  - Vist (shownCount): Times the popup was displayed');
    console.log('  - Sendt inn (submittedCount): Times email was submitted');
    console.log('  - Konv. % (conversionRate): submittedCount / shownCount * 100');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

verifyCampaign();
