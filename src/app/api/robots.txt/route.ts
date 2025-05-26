import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/api/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 