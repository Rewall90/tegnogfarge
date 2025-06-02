import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
// import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { mapToFavoriteModel } from '../../../../models/favorite';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Ikke autorisert' },
        { status: 401 }
      );
    }

    // const client = await clientPromise;
    // const db = client.db();
    
    // Get user ID from the session
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Bruker ikke funnet' },
        { status: 404 }
      );
    }

    // Join favorites with drawings to get drawing details
    const favorites = await db.collection('favorites')
      .aggregate([
        { $match: { userId: user._id } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'drawings',
            localField: 'drawingId',
            foreignField: '_id',
            as: 'drawing'
          }
        },
        { $unwind: '$drawing' }
      ])
      .toArray();

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { message: 'Kunne ikke hente favoritter' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Ikke autorisert' },
        { status: 401 }
      );
    }

    const { drawingId } = await request.json();

    if (!drawingId) {
      return NextResponse.json(
        { message: 'Tegnings-ID er påkrevd' },
        { status: 400 }
      );
    }

    // const client = await clientPromise;
    // const db = client.db();

    // Get user ID from the session
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Bruker ikke funnet' },
        { status: 404 }
      );
    }

    // Check if drawing exists
    const drawingCollection = db.collection('drawings');
    const drawing = await drawingCollection.findOne({ _id: new ObjectId(drawingId) });
    
    if (!drawing) {
      return NextResponse.json(
        { message: 'Tegning ikke funnet' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const favoriteCollection = db.collection('favorites');
    const existingFavorite = await favoriteCollection.findOne({
      userId: user._id,
      drawingId: new ObjectId(drawingId)
    });
    
    if (existingFavorite) {
      return NextResponse.json(
        { message: 'Tegningen er allerede lagt til i favoritter' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = {
      userId: user._id,
      drawingId: new ObjectId(drawingId),
      createdAt: new Date()
    };

    const result = await favoriteCollection.insertOne(favorite);
    const insertedFavorite = await favoriteCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(
      { favorite: mapToFavoriteModel(insertedFavorite) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { message: 'Kunne ikke legge til favoritt' },
      { status: 500 }
    );
  }
} 