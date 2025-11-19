import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';
import type { Campaign } from '@/lib/campaignService';

/**
 * GET /api/lead-campaigns/[campaignId]
 *
 * Get a single campaign by ID (admin only)
 */
export async function GET(
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
    const collection = db.collection<Campaign>('lead_campaigns');

    const campaign = await collection.findOne({
      campaignId,
      deleted: { $ne: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('[API] Error fetching campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

/**
 * PUT /api/lead-campaigns/[campaignId]
 *
 * Update a campaign (admin only)
 */
export async function PUT(
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
    const body = await request.json();

    const db = await getDb();
    const collection = db.collection<Campaign>('lead_campaigns');

    // Check if campaign exists
    const existing = await collection.findOne({
      campaignId,
      deleted: { $ne: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Update campaign
    const updateData: Partial<Campaign> = {
      name: body.name,
      type: body.type,
      active: body.active,
      trigger: body.trigger,
      content: body.content,
      weight: body.weight ?? 1,
      featureFlagKey: body.featureFlagKey || undefined,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { campaignId, deleted: { $ne: true } },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch and return updated campaign
    const updated = await collection.findOne({ campaignId });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

/**
 * PATCH /api/lead-campaigns/[campaignId]
 *
 * Toggle campaign pause/resume (admin only)
 * This is a lightweight endpoint for quick pause/resume actions
 */
export async function PATCH(
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
    const body = await request.json();

    const db = await getDb();
    const collection = db.collection<Campaign>('lead_campaigns');

    // Check if campaign exists
    const existing = await collection.findOne({
      campaignId,
      deleted: { $ne: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Toggle active state
    const newActiveState = body.active !== undefined ? body.active : !existing.active;

    const result = await collection.updateOne(
      { campaignId, deleted: { $ne: true } },
      {
        $set: {
          active: newActiveState,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch and return updated campaign
    const updated = await collection.findOne({ campaignId });

    return NextResponse.json({
      success: true,
      campaign: updated,
      message: newActiveState ? 'Campaign resumed' : 'Campaign paused',
    });
  } catch (error) {
    console.error('[API] Error toggling campaign:', error);
    return NextResponse.json({ error: 'Failed to toggle campaign' }, { status: 500 });
  }
}

/**
 * DELETE /api/lead-campaigns/[campaignId]
 *
 * Soft delete a campaign (admin only)
 * Sets deleted: true instead of removing from database
 */
export async function DELETE(
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
    const collection = db.collection<Campaign>('lead_campaigns');

    // Check if campaign exists
    const existing = await collection.findOne({
      campaignId,
      deleted: { $ne: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Soft delete (set deleted flag)
    const result = await collection.updateOne(
      { campaignId },
      {
        $set: {
          deleted: true,
          active: false, // Also deactivate when deleting
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
