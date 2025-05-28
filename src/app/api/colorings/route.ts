import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { mapToColoringModel } from '../../../../models/coloring';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('isPublic') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('colorings');

    const query: Record<string, unknown> = {};
    
    // If userId is specified, filter by user
    if (userId) {
      query.userId = new ObjectId(userId);
    }
    
    // If isPublic is specified, filter by public status
    if (isPublic !== undefined) {
      query.isPublic = isPublic;
    }

    const colorings = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      colorings: colorings.map(mapToColoringModel),
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching colorings:', error);
    return NextResponse.json(
      { message: 'Kunne ikke hente fargelegginger' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Ikke autorisert' },
        { status: 401 }
      );
    }

    const { drawingId, imageUrl, name, isPublic = false, tags = [] } = await request.json();

    if (!drawingId || !imageUrl) {
      return NextResponse.json(
        { message: 'Tegnings-ID og bilde-URL er påkrevd' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user ID from the session
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Bruker ikke funnet' },
        { status: 404 }
      );
    }

    // Create the coloring entry
    const coloring = {
      userId: user._id,
      drawingId: new ObjectId(drawingId),
      imageUrl,
      name: name || 'Uten navn',
      isPublic,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0
    };

    const result = await db.collection('colorings').insertOne(coloring);
    
    const insertedColoring = await db.collection('colorings').findOne({ _id: result.insertedId });

    return NextResponse.json(
      { coloring: mapToColoringModel(insertedColoring) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coloring:', error);
    return NextResponse.json(
      { message: 'Kunne ikke lagre fargelegging' },
      { status: 500 }
    );
  }
} 