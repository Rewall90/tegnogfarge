import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';

/**
 * GET /api/admin/email-stats?campaignId=xxx
 *
 * Get email tracking statistics for a campaign
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

    const campaignId = request.nextUrl.searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const trackingCollection = db.collection('email_tracking_events');
    const submissionsCollection = db.collection('lead_submissions');

    // Get all submissions for this campaign that have been sent emails
    const submissions = await submissionsCollection
      .find({
        campaignId,
        'emailHistory.0': { $exists: true }, // Has at least one email sent
      })
      .toArray();

    // Include both test and regular emails in the count
    const totalSent = submissions.reduce((sum, sub) => {
      return sum + (sub.emailHistory?.length || 0);
    }, 0);

    // Get open statistics
    const openEvents = await trackingCollection
      .find({
        campaignId,
        eventType: 'open',
      })
      .toArray();

    const uniqueOpens = new Set(openEvents.map(e => e.email)).size;
    const totalOpens = openEvents.reduce((sum, event) => sum + (event.openCount || 1), 0);

    // Get click statistics
    const clickEvents = await trackingCollection
      .find({
        campaignId,
        eventType: 'click',
      })
      .toArray();

    const uniqueClicks = new Set(clickEvents.map(e => e.email)).size;
    const totalClicks = clickEvents.length;

    // Get detailed recipient stats
    const recipientStats = await Promise.all(
      submissions.map(async (submission) => {
        const opens = await trackingCollection
          .find({
            email: submission.email,
            campaignId,
            eventType: 'open',
          })
          .toArray();

        const clicks = await trackingCollection
          .find({
            email: submission.email,
            campaignId,
            eventType: 'click',
          })
          .toArray();

        // Include all emails (both test and regular)
        const emailsSent = submission.emailHistory || [];
        const testEmails = emailsSent.filter((h: any) => h.testMode);

        return {
          email: submission.email,
          emailsSent: emailsSent.length,
          lastSentAt: emailsSent.length > 0 ? emailsSent[emailsSent.length - 1].sentAt : null,
          isTestRecipient: testEmails.length > 0,
          opened: opens.length > 0,
          openCount: opens.reduce((sum: number, e: any) => sum + (e.openCount || 1), 0),
          lastOpenedAt: opens.length > 0 ? opens[opens.length - 1].lastOpenedAt : null,
          clicked: clicks.length > 0,
          clickCount: clicks.length,
          lastClickedAt: clicks.length > 0 ? clicks[clicks.length - 1].clickedAt : null,
          clickedLinks: clicks.map((c: any) => ({
            url: c.destinationUrl,
            clickedAt: c.clickedAt,
          })),
        };
      })
    );

    // Calculate rates
    const openRate = totalSent > 0 ? (uniqueOpens / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (uniqueClicks / totalSent) * 100 : 0;
    const clickToOpenRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;

    return NextResponse.json({
      campaignId,
      summary: {
        totalSent,
        uniqueOpens,
        totalOpens,
        uniqueClicks,
        totalClicks,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        clickToOpenRate: Math.round(clickToOpenRate * 100) / 100,
      },
      recipients: recipientStats.sort((a, b) => {
        // Sort by last sent date, most recent first
        if (!a.lastSentAt) return 1;
        if (!b.lastSentAt) return -1;
        return new Date(b.lastSentAt).getTime() - new Date(a.lastSentAt).getTime();
      }),
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error fetching email stats:', typedError);
    return NextResponse.json(
      { error: 'Internal server error', message: typedError.message },
      { status: 500 }
    );
  }
}
