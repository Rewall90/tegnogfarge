import { NextResponse } from 'next/server';
import { getAllCategories, getPosts, getAllColoringImages } from '@/lib/sanity';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fargelegg.no';
  
  try {
    // Fetch data from Sanity
    const categories = await getAllCategories();
    const blogPosts = await getPosts();
    const drawings = await getAllColoringImages();
    
    // XML generation
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Current date for static pages
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Add static pages
    sitemap += `
      <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/blog</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
      <url>
        <loc>${baseUrl}/Lisens</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
      </url>
      <url>
        <loc>${baseUrl}/skribent</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
      </url>
    `;
    
    // Add blog posts
    for (const post of blogPosts) {
      const lastmod = post._updatedAt || post._createdAt || currentDate;
      sitemap += `
      <url>
        <loc>${baseUrl}/blog/${post.slug?.current || post.slug}</loc>
        <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>`;
    }
    
    // Add categories
    for (const category of categories) {
      const lastmod = category._updatedAt || category._createdAt || currentDate;
      sitemap += `
      <url>
        <loc>${baseUrl}/${category.slug}</loc>
        <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
      
      // Add subcategories if available
      if (category.subcategories && category.subcategories.length > 0) {
        for (const subcategory of category.subcategories) {
          const subLastmod = subcategory._updatedAt || subcategory._createdAt || currentDate;
          sitemap += `
          <url>
            <loc>${baseUrl}/${category.slug}/${subcategory.slug}</loc>
            <lastmod>${new Date(subLastmod).toISOString().split('T')[0]}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.6</priority>
          </url>`;
        }
      }
    }
    
    // Add drawings
    for (const drawing of drawings) {
      const lastmod = drawing._updatedAt || drawing._createdAt || drawing.publishedDate || currentDate;
      sitemap += `
      <url>
        <loc>${baseUrl}/coloring/${drawing._id}</loc>
        <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>`;
    }
    
    sitemap += '</urlset>';
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap with just static pages if there's an error
    const currentDate = new Date().toISOString().split('T')[0];
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    sitemap += `
      <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/blog</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
      <url>
        <loc>${baseUrl}/Lisens</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
      </url>
      <url>
        <loc>${baseUrl}/skribent</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
      </url>
    `;
    sitemap += '</urlset>';
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
} 