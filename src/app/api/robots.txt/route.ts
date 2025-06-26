import { NextResponse } from 'next/server';

const { NEXT_PUBLIC_BASE_URL } = process.env;

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /studio/

Sitemap: ${NEXT_PUBLIC_BASE_URL}/sitemap.xml
`;

  return new NextResponse(robotsTxt.trim(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 