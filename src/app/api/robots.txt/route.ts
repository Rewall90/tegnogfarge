import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fargelegg.no';
  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

# Sitemaps
Sitemap: ${baseUrl}/api/sitemap.xml
Sitemap: ${baseUrl}/api/image-sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 