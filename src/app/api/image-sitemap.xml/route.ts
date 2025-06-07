import { NextResponse } from 'next/server';
import { getAllColoringImages } from '@/lib/sanity';
import { extractDimensionsFromUrl } from '@/lib/json-ld-utils';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fargelegg.no';
  
  try {
    // Fetch all coloring images from Sanity
    const drawings = await getAllColoringImages();
    
    // XML generation
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
    
    // Process all drawings
    for (const drawing of drawings) {
      if (!drawing.imageUrl && !drawing.image?.url) continue;
      
      const imageUrl = drawing.image?.url || drawing.imageUrl;
      const title = drawing.title;
      const caption = drawing.description || `${title} fargeleggingsark`;
      const url = `${baseUrl}/coloring/${drawing._id}`;
      
      // Extract dimensions if available
      const dimensions = drawing.image?.metadata?.dimensions || 
                        extractDimensionsFromUrl(imageUrl) ||
                        { width: 800, height: 600 };
      
      // Special character handling for XML
      const safeTitle = encodeXmlEntities(title);
      const safeCaption = encodeXmlEntities(caption);
      
      sitemap += `
      <url>
        <loc>${url}</loc>
        <image:image>
          <image:loc>${imageUrl}</image:loc>
          <image:title>${safeTitle}</image:title>
          <image:caption>${safeCaption}</image:caption>
          <image:license>${STRUCTURED_DATA.LEGAL.LICENSE_URL}</image:license>
          <image:geo_location>Norway</image:geo_location>
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
    
    // Return a basic empty sitemap if there's an error
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
    sitemap += '</urlset>';
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

/**
 * Helper function to encode XML entities
 */
function encodeXmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 