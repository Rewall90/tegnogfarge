import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/db';
import { Document } from 'mongodb';
import { mapToBlogPostModel } from '../../../../models/blogPost';
import { createSlug } from '../../../../utils/slug';
import { getPosts } from '@/lib/sanity';

export async function GET(request: Request) {
  try {
    // Hent blogginnlegg fra Sanity
    const blogPosts = await getPosts();
    return NextResponse.json({
      posts: blogPosts,
      totalPages: 1, // Sanity returnerer alle, paginering kan implementeres senere
      currentPage: 1
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { message: 'Kunne ikke hente blogginnlegg' },
      { status: 500 }
    );
  }
}

// POST/PUT/DELETE er deaktivert fordi all skriving skal skje via Sanity Studio.
// Hvis du ønsker å støtte admin-skriving til Sanity via API, må du bruke Sanity sitt API og tokens.

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