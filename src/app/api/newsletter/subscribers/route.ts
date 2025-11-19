import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET - Fetch all subscribers with filtering
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
    const status = searchParams.get('status'); // 'all', 'verified', 'pending', 'unsubscribed'
    const search = searchParams.get('search'); // email search
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('newsletter');

    // Build query
    const query: any = {};

    // Filter by status
    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'pending') {
      query.isVerified = false;
    }
    // Note: Newsletter subscribers don't have unsubscribedAt field

    // Search by email
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Fetch subscribers
    const subscribers = await db
      .collection('subscribers')
      .find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection('subscribers').countDocuments(query);

    // Get statistics
    const stats = {
      total: await db.collection('subscribers').countDocuments({}),
      verified: await db.collection('subscribers').countDocuments({
        isVerified: true
      }),
      pending: await db.collection('subscribers').countDocuments({
        isVerified: false
      }),
      unsubscribed: 0, // Newsletter subscribers don't have unsubscribe tracking
    };

    return NextResponse.json({
      subscribers: subscribers.map(sub => ({
        _id: sub._id.toString(),
        email: sub.email,
        isVerified: sub.isVerified,
        createdAt: sub.subscribedAt, // Map subscribedAt to createdAt for frontend compatibility
        verifiedAt: sub.isVerified ? sub.subscribedAt : null, // Use subscribedAt as verifiedAt if verified
        unsubscribedAt: null, // Newsletter subscribers don't have unsubscribe tracking
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error fetching subscribers:', typedError);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subscriber
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

    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('newsletter');

    const result = await db.collection('subscribers').deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Subscriber deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error deleting subscriber:', typedError);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
