import { NextResponse } from 'next/server';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export async function GET() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  
  const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /studio/
Disallow: /verify-email*
Disallow: /verify-newsletter*
Disallow: /register*
Disallow: /login*
Disallow: /coloring-app?*

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt.trim(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 