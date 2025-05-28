import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Drawing, mapToDrawingModel } from '../../../../models/drawing';
import { ObjectId } from 'mongodb';

interface Query { isPublished: boolean; categoryId?: ObjectId }

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('drawings');

    const query: Query = { isPublished: true };
    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }

    const drawings = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    const mappedDrawings = drawings.map(mapToDrawingModel);

    return NextResponse.json({
      drawings: mappedDrawings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return NextResponse.json({ error: 'Failed to fetch drawings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the data
    if (!data.title || !data.imageUrl || !data.categoryId) {
      return NextResponse.json(
        { error: 'Title, image URL, and category ID are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const drawing: Partial<Drawing> = {
      title: data.title,
      description: data.description || '',
      imageUrl: data.imageUrl,
      categoryId: new ObjectId(data.categoryId),
      difficulty: data.difficulty || 'medium',
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: data.isPublished ?? true,
      downloadCount: 0
    };

    if (data.authorId) {
      drawing.authorId = new ObjectId(data.authorId);
    }

    const result = await db.collection('drawings').insertOne(drawing);
    
    return NextResponse.json({ 
      success: true, 
      drawingId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating drawing:', error);
    return NextResponse.json({ error: 'Failed to create drawing' }, { status: 500 });
  }
} 