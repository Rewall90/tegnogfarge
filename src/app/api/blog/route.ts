import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/sanity';

export async function GET() {
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