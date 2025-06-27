/**
 * Test script for sitemap generation
 * Run with: ts-node src/lib/test-sitemap.ts
 */

import { getAllColoringImages } from './sanity';
import { extractDimensionsFromUrl } from './json-ld-utils';
import { STRUCTURED_DATA } from './structured-data-constants';

// Mock drawing for testing when Sanity data is not available
const MOCK_DRAWING = {
  _id: 'drawing123',
  title: 'Testbilde for fargelegging',
  description: 'Et testbilde for strukturerte data',
      imageUrl: 'https://tegnogfarge.no/images/test-drawing.jpg',
  image: {
          url: 'https://tegnogfarge.no/images/test-drawing.jpg',
    alt: 'Test fargeleggingsark',
    metadata: {
      dimensions: {
        width: 800, 
        height: 600
      }
    }
  }
};

async function testImageSitemap() {
  try {
    console.log('Testing image sitemap generation...');
    
    // Always use mock data for reliable testing
    const mockDrawings = [MOCK_DRAWING];
    console.log(`Testing with mock drawing data`);
    
    // Generate a sample XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Process test drawings
    for (const drawing of mockDrawings) {
      if (!drawing.imageUrl && !drawing.image?.url) {
        console.log(`Skipping drawing "${drawing.title}" - no image URL`);
        continue;
      }
      
      const imageUrl = drawing.image?.url || drawing.imageUrl;
      const title = drawing.title || 'Untitled';
      const caption = drawing.description || `${title} fargeleggingsark`;
      
      // Extract dimensions if available
      const dimensions = drawing.image?.metadata?.dimensions || 
                        extractDimensionsFromUrl(imageUrl) ||
                        { width: 800, height: 600 };
      
      console.log(`Processing drawing: "${title}"`);
      console.log(`- Image URL: ${imageUrl}`);
      console.log(`- Dimensions: ${dimensions.width}x${dimensions.height}`);
      
      // Special character handling test
      const safeTitle = encodeXmlEntities(title);
      const safeCaption = encodeXmlEntities(caption);
      
      if (safeTitle !== title || safeCaption !== caption) {
        console.log('- Special characters handled in title/caption');
      }
      
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://tegnogfarge.no/coloring/${drawing._id}</loc>\n`;
      sitemap += `    <image:image>\n`;
      sitemap += `      <image:loc>${imageUrl}</image:loc>\n`;
      sitemap += `      <image:title>${safeTitle}</image:title>\n`;
      sitemap += `      <image:caption>${safeCaption}</image:caption>\n`;
      sitemap += `      <image:license>${STRUCTURED_DATA.LEGAL.LICENSE_URL}</image:license>\n`;
      sitemap += `    </image:image>\n`;
      sitemap += `  </url>\n`;
    }
    
    sitemap += '</urlset>';
    
    console.log('\nSample XML output:');
    console.log('------------------');
    console.log(sitemap);
    console.log('------------------');
    
    console.log('\nImage sitemap test completed successfully!');
    
  } catch (error) {
    console.error('Error testing image sitemap:', error);
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

// Run the test if this script is executed directly
if (require.main === module) {
  testImageSitemap().catch(console.error);
} 