import { NextResponse } from "next/server";
import { getSitemapPageData } from "@/lib/sanity";
import type {
  SitemapPageData,
  SitemapPost,
  SitemapCategory,
  SitemapSubcategory,
  SitemapDrawing,
} from "@/types";

const { NEXT_PUBLIC_BASE_URL } = process.env;

// Helper to format date
function formatDate(dateString: string) {
  return new Date(dateString).toISOString().split("T")[0];
}

// Helper to generate a URL entry
function generateUrlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: number,
) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  try {
    const sitemapData: SitemapPageData = await getSitemapPageData();
    const currentDate = formatDate(new Date().toISOString());

    const staticPages = [
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/`,
        lastmod: currentDate,
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/hoved-kategori`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/blog`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/om-oss`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/kontakt`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/om-skribenten`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/personvernerklaering`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/vilkar-og-betingelser`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/lisensieringspolicy`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${NEXT_PUBLIC_BASE_URL}/fjerning-av-innhold`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      xml += generateUrlEntry(
        page.loc,
        page.lastmod,
        page.changefreq,
        page.priority,
      );
    });

    // Add blog posts
    sitemapData.posts?.forEach((post: SitemapPost) => {
      xml += generateUrlEntry(
        `${NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`,
        formatDate(post._updatedAt),
        "monthly",
        0.7,
      );
    });

    // Add categories
    sitemapData.categories?.forEach((category: SitemapCategory) => {
      xml += generateUrlEntry(
        `${NEXT_PUBLIC_BASE_URL}/${category.slug}`,
        formatDate(category._updatedAt),
        "weekly",
        0.8,
      );
    });

    // Add subcategories
    sitemapData.subcategories?.forEach((subcategory: SitemapSubcategory) => {
      xml += generateUrlEntry(
        `${NEXT_PUBLIC_BASE_URL}/${subcategory.parentCategorySlug}/${subcategory.slug}`,
        formatDate(subcategory._updatedAt),
        "weekly",
        0.7,
      );
    });

    // Add drawings
    sitemapData.drawings?.forEach((drawing: SitemapDrawing) => {
      xml += generateUrlEntry(
        `${NEXT_PUBLIC_BASE_URL}/${drawing.parentCategorySlug}/${drawing.subcategorySlug}/${drawing.slug}`,
        formatDate(drawing._updatedAt),
        "monthly",
        0.6,
      );
    });

    xml += `
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating pages sitemap:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 