import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';
import type { Campaign } from '@/lib/campaignService';

/**
 * GET /api/lead-campaigns
 *
 * List all campaigns (admin only, excludes soft-deleted)
 * Returns campaigns with their stats
 */
export async function GET() {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const campaignsCollection = db.collection<Campaign>('lead_campaigns');
    const statsCollection = db.collection('lead_campaign_stats');

    // Get all non-deleted campaigns
    const campaigns = await campaignsCollection
      .find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await statsCollection.findOne({
          campaignId: campaign.campaignId,
        });

        return {
          ...campaign,
          stats: stats
            ? {
                shownCount: stats.shownCount || 0,
                submittedCount: stats.submittedCount || 0,
                dismissedCount: stats.dismissedCount || 0,
                conversionRate:
                  stats.shownCount > 0
                    ? Math.round((stats.submittedCount / stats.shownCount) * 100 * 10) / 10
                    : 0,
                dismissRate:
                  stats.shownCount > 0
                    ? Math.round((stats.dismissedCount / stats.shownCount) * 100 * 10) / 10
                    : 0,
              }
            : {
                shownCount: 0,
                submittedCount: 0,
                dismissedCount: 0,
                conversionRate: 0,
                dismissRate: 0,
              },
        };
      })
    );

    return NextResponse.json(campaignsWithStats);
  } catch (error) {
    console.error('[API] Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

/**
 * POST /api/lead-campaigns
 *
 * Create a new campaign (admin only)
 */
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.name || !body.type || !body.trigger || !body.content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate campaignId from name (slug-style)
    const campaignId =
      body.campaignId ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const db = await getDb();
    const collection = db.collection<Campaign>('lead_campaigns');

    // Check if campaignId already exists
    const existing = await collection.findOne({ campaignId });
    if (existing) {
      return NextResponse.json(
        { error: 'Campaign ID already exists' },
        { status: 409 }
      );
    }

    // Create campaign
    const campaign: Campaign = {
      campaignId,
      name: body.name,
      type: body.type,
      active: body.active ?? false,
      trigger: body.trigger,
      content: body.content,
      weight: body.weight ?? 1,
      deleted: false,
      featureFlagKey: body.featureFlagKey || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(campaign as any);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
