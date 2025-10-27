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

    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { message: 'Unauthorized' },
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
      query.unsubscribedAt = { $exists: false };
    } else if (status === 'pending') {
      query.isVerified = false;
      query.unsubscribedAt = { $exists: false };
    } else if (status === 'unsubscribed') {
      query.unsubscribedAt = { $exists: true };
    }

    // Search by email
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Fetch subscribers
    const subscribers = await db
      .collection('subscribers')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection('subscribers').countDocuments(query);

    // Get statistics
    const stats = {
      total: await db.collection('subscribers').countDocuments({}),
      verified: await db.collection('subscribers').countDocuments({
        isVerified: true,
        unsubscribedAt: { $exists: false }
      }),
      pending: await db.collection('subscribers').countDocuments({
        isVerified: false,
        unsubscribedAt: { $exists: false }
      }),
      unsubscribed: await db.collection('subscribers').countDocuments({
        unsubscribedAt: { $exists: true }
      }),
    };

    return NextResponse.json({
      subscribers: subscribers.map(sub => ({
        _id: sub._id.toString(),
        email: sub.email,
        isVerified: sub.isVerified,
        createdAt: sub.createdAt,
        verifiedAt: sub.verifiedAt || null,
        unsubscribedAt: sub.unsubscribedAt || null,
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

    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { message: 'Unauthorized' },
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
