import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';

/**
 * GET /api/lead-campaigns/submissions
 *
 * Fetch lead submissions with filters, pagination, and stats
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const campaignId = searchParams.get('campaignId');
    const search = searchParams.get('search');

    const db = await getDb();
    const collection = db.collection('lead_submissions');

    // Build filter
    const filter: any = {};

    if (status === 'verified') {
      filter.isVerified = true;
      filter.unsubscribedAt = null;
    } else if (status === 'pending') {
      filter.isVerified = false;
      filter.unsubscribedAt = null;
    } else if (status === 'unsubscribed') {
      filter.unsubscribedAt = { $ne: null };
    }

    if (campaignId && campaignId !== 'all') {
      filter.campaignId = campaignId;
    }

    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    // Get total count
    const total = await collection.countDocuments(filter);

    // Get submissions with pagination
    const submissions = await collection
      .find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // DEBUG: Log date information
    console.log('[Lead Campaigns API DEBUG] Filter:', JSON.stringify(filter));
    console.log('[Lead Campaigns API DEBUG] Total found:', submissions.length);
    if (submissions.length > 0) {
      console.log('[Lead Campaigns API DEBUG] First submission date:', submissions[0].submittedAt);
      console.log('[Lead Campaigns API DEBUG] Last submission date:', submissions[submissions.length - 1].submittedAt);
      console.log('[Lead Campaigns API DEBUG] First submission:', { email: submissions[0].email, submittedAt: submissions[0].submittedAt, campaignId: submissions[0].campaignId });
    }

    // Get stats - filter by campaign if specified
    const statsFilter = campaignId && campaignId !== 'all' ? { campaignId } : {};
    const stats = {
      total: await collection.countDocuments(statsFilter),
      verified: await collection.countDocuments({ ...statsFilter, isVerified: true, unsubscribedAt: null }),
      pending: await collection.countDocuments({ ...statsFilter, isVerified: false, unsubscribedAt: null }),
      unsubscribed: await collection.countDocuments({ ...statsFilter, unsubscribedAt: { $ne: null } }),
    };

    return NextResponse.json({
      submissions: submissions.map((sub) => ({
        ...sub,
        _id: sub._id.toString(),
      })),
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error fetching lead submissions:', typedError);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lead-campaigns/submissions?email=xxx&campaignId=xxx
 *
 * Delete a lead submission
 * Admin only
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const campaignId = searchParams.get('campaignId');

    if (!email || !campaignId) {
      return NextResponse.json(
        { error: 'Email and campaignId are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('lead_submissions');

    const result = await collection.deleteOne({ email, campaignId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error deleting lead submission:', typedError);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
