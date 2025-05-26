import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '../../../../lib/db';
import { ObjectId } from 'mongodb';
import { mapToBlogPostModel } from '../../../../models/blogPost';
import { createSlug } from '../../../../utils/slug';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    
    const query: any = { published: true };
    
    // Filter by tag if provided
    if (tag) {
      query.tags = tag;
    }

    // Join with users to get author info
    const blogPosts = await db.collection('blogPosts')
      .aggregate([
        { $match: query },
        { $sort: { publishedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            content: 1,
            excerpt: 1,
            authorId: 1,
            imageUrl: 1,
            tags: 1,
            published: 1,
            createdAt: 1,
            updatedAt: 1,
            publishedAt: 1,
            'author._id': 1,
            'author.name': 1,
            'author.image': 1
          }
        }
      ])
      .toArray();

    const total = await db.collection('blogPosts').countDocuments(query);

    return NextResponse.json({
      posts: blogPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { message: 'Kunne ikke hente blogginnlegg' },
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

    // Check if user is admin
    const client = await clientPromise;
    const db = client.db();
    
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Kun administratorer kan opprette blogginnlegg' },
        { status: 403 }
      );
    }

    const { title, content, excerpt, imageUrl, tags = [], published = false } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Tittel og innhold er påkrevd' },
        { status: 400 }
      );
    }

    // Get all existing slugs to generate a unique one
    const existingSlugs = await db.collection('blogPosts')
      .find({}, { projection: { slug: 1 } })
      .map((post: any) => post.slug)
      .toArray();

    const slug = createSlug(title);
    const uniqueSlug = generateUniqueSlug(slug, existingSlugs);

    const now = new Date();
    const blogPost = {
      title,
      slug: uniqueSlug,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      authorId: user._id,
      imageUrl,
      tags,
      published,
      createdAt: now,
      updatedAt: now,
      publishedAt: published ? now : null
    };

    const result = await db.collection('blogPosts').insertOne(blogPost);
    const insertedPost = await db.collection('blogPosts').findOne({ _id: result.insertedId });

    return NextResponse.json(
      { post: mapToBlogPostModel(insertedPost) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { message: 'Kunne ikke opprette blogginnlegg' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique slug
function generateUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
} 