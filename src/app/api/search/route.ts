import { NextResponse } from 'next/server';
import { searchDrawings } from '@/lib/sanity';

export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (typeof query !== 'string' || query.length < 2) {
      return NextResponse.json([]); // Return empty if query is too short
    }

    // We use the existing search function but limit the results for the preview
    const results = await searchDrawings(query, 4); 

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during search.' },
      { status: 500 }
    );
  }
} 