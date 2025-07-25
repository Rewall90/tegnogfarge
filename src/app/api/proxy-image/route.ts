import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 });
    }
    
    // Validate that the URL is from Sanity CDN
    if (!imageUrl.includes('cdn.sanity.io')) {
      console.warn('Blocked request to non-Sanity URL:', imageUrl);
      return new NextResponse('Invalid image source', { status: 403 });
    }
    
    // Additional validation for URL format
    try {
      const urlObj = new URL(imageUrl);
      if (urlObj.hostname !== 'cdn.sanity.io') {
        return new NextResponse('Invalid hostname', { status: 403 });
      }
    } catch {
      return new NextResponse('Malformed URL', { status: 400 });
    }
    
    // Fetch the image from Sanity with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent': 'tegnogfarge-image-proxy/1.0',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!imageResponse.ok) {
      return new NextResponse('Failed to fetch image', { status: imageResponse.status });
    }
    
    const contentType = imageResponse.headers.get('content-type');
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Return the image with proper CORS headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}