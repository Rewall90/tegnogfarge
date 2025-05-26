import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/db';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get published blog posts
    const blogPosts = await db.collection('blogPosts')
      .find({ published: true })
      .project({ slug: 1, updatedAt: 1 })
      .toArray();
    
    // Get categories
    const categories = await db.collection('categories')
      .find({ isActive: true })
      .project({ slug: 1, updatedAt: 1 })
      .toArray();
      
    // Get drawings (limit to published ones)
    const drawings = await db.collection('drawings')
      .find({ isPublished: true })
      .project({ _id: 1, updatedAt: 1 })
      .toArray();
    
    // XML generation
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Add static pages
    sitemap += `
      <url>
        <loc>${baseUrl}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/categories</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/blog</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
    `;
    
    // Add blog posts
    for (const post of blogPosts) {
      sitemap += `
      <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>`;
    }
    
    // Add categories
    for (const category of categories) {
      sitemap += `
      <url>
        <loc>${baseUrl}/categories/${category.slug}</loc>
        <lastmod>${new Date(category.updatedAt).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
    }
    
    // Add drawings
    for (const drawing of drawings) {
      sitemap += `
      <url>
        <loc>${baseUrl}/coloring/${drawing._id}</loc>
        <lastmod>${new Date(drawing.updatedAt).toISOString()}</lastmod>
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
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    sitemap += `
      <url>
        <loc>${baseUrl}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/categories</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/blog</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
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