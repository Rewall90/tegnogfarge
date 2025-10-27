import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Campaign } from '@/lib/campaignService';

/**
 * GET /api/lead-campaigns/active
 *
 * Get all active campaigns (public endpoint for frontend)
 * Used by campaignService.ts to fetch campaigns
 * Excludes soft-deleted campaigns
 */
export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection<Campaign>('lead_campaigns');

    // Get all active, non-deleted campaigns
    const campaigns = await collection
      .find({
        active: true,
        deleted: { $ne: true },
      })
      .toArray();

    // TODO: When PostHog feature flags are activated, check flags here
    // For now, return all active campaigns
    // const filteredCampaigns = campaigns.filter(campaign => {
    //   if (!campaign.featureFlagKey) return true;
    //   return checkPostHogFeatureFlag(campaign.featureFlagKey);
    // });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('[API] Error fetching active campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch active campaigns' }, { status: 500 });
  }
}
