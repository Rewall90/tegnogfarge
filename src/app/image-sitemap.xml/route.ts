import { NextResponse } from 'next/server';
import { getSitemapImageData } from '@/lib/sanity';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

function encodeXmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  
  try {
    const drawings = await getSitemapImageData();
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
    
    for (const drawing of drawings) {
      if (!drawing.imageUrl || !drawing.categorySlug || !drawing.subcategorySlug || !drawing.drawingSlug) {
        continue;
      }
      
      const pageUrl = `${baseUrl}/${drawing.categorySlug}/${drawing.subcategorySlug}/${drawing.drawingSlug}`;
      const safeTitle = encodeXmlEntities(drawing.title);
      const safeCaption = encodeXmlEntities(drawing.description || `${drawing.title} fargeleggingsark`);
      
      sitemap += `
      <url>
        <loc>${pageUrl}</loc>
        <lastmod>${new Date(drawing._updatedAt).toISOString().split('T')[0]}</lastmod>
        <image:image>
          <image:loc>${drawing.imageUrl}</image:loc>
          <image:title>${safeTitle}</image:title>
          <image:caption>${safeCaption}</image:caption>
        </image:image>
      </url>`;
    }
    
    sitemap += '</urlset>';
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 