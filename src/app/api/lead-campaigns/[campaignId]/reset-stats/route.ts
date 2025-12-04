import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';

/**
 * POST /api/lead-campaigns/[campaignId]/reset-stats
 *
 * Reset stats for a specific campaign (admin only)
 * This resets the counters in lead_campaign_stats collection
 */
export async function POST(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { campaignId } = params;

    const db = await getDb();
    const campaignsCollection = db.collection('lead_campaigns');
    const statsCollection = db.collection('lead_campaign_stats');

    // Check if campaign exists
    const campaign = await campaignsCollection.findOne({
      campaignId,
      deleted: { $ne: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Reset stats - update or insert with zero values
    await statsCollection.updateOne(
      { campaignId },
      {
        $set: {
          shownCount: 0,
          submittedCount: 0,
          dismissedCount: 0,
          resetAt: new Date(),
          resetBy: session.user.email || 'admin',
        },
      },
      { upsert: true }
    );

    console.log(`[API] Stats reset for campaign: ${campaignId} by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `Stats reset for campaign: ${campaign.name}`,
      campaignId,
    });
  } catch (error) {
    console.error('[API] Error resetting campaign stats:', error);
    return NextResponse.json({ error: 'Failed to reset stats' }, { status: 500 });
  }
}
