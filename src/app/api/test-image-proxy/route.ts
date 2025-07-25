import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not available in production', { status: 404 });
  }
  
  const testImageUrl = 'https://cdn.sanity.io/images/fn0kjvlp/production/test-image.webp';
  
  try {
    // Test the proxy endpoint
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(testImageUrl)}`;
    
    return NextResponse.json({
      status: 'success',
      message: 'Image proxy test endpoint',
      testImageUrl,
      proxyUrl,
      instructions: [
        '1. Replace "test-image.webp" with an actual Sanity image URL',
        '2. Visit the proxyUrl to test if the proxy works',
        '3. Check browser console for any CORS errors'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}