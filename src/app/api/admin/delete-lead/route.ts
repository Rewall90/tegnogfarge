import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';

/**
 * DELETE /api/admin/delete-lead?email=xxx&campaignId=xxx
 *
 * Delete a lead submission and all associated tracking data
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

    const email = request.nextUrl.searchParams.get('email');
    const campaignId = request.nextUrl.searchParams.get('campaignId');

    if (!email || !campaignId) {
      return NextResponse.json(
        { error: 'Email and Campaign ID are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');
    const trackingCollection = db.collection('email_tracking_events');

    // Delete the lead submission
    const submissionResult = await submissionsCollection.deleteOne({
      email,
      campaignId,
    });

    // Delete all tracking events for this email/campaign
    const trackingResult = await trackingCollection.deleteMany({
      email,
      campaignId,
    });

    if (submissionResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Lead submission not found' },
        { status: 404 }
      );
    }

    console.log(`[Delete Lead] Deleted submission and ${trackingResult.deletedCount} tracking events for ${email} in campaign ${campaignId}`);

    return NextResponse.json({
      message: 'Lead submission and tracking data deleted successfully',
      deletedSubmissions: submissionResult.deletedCount,
      deletedTrackingEvents: trackingResult.deletedCount,
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error deleting lead:', typedError);
    return NextResponse.json(
      { error: 'Internal server error', message: typedError.message },
      { status: 500 }
    );
  }
}
