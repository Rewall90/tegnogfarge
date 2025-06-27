import { NextResponse } from "next/server";
import { getSitemapPageData } from "@/lib/sanity";
import { STRUCTURED_DATA } from "@/lib/structured-data-constants";
import type {
  SitemapPageData,
  SitemapPost,
  SitemapCategory,
  SitemapSubcategory,
  SitemapDrawing,
} from "@/types";

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
    const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
    const sitemapData: SitemapPageData = await getSitemapPageData();
    const currentDate = formatDate(new Date().toISOString());

    const mostRecentUpdate =
      sitemapData.posts?.[0]?._updatedAt ||
      sitemapData.drawings?.[0]?._updatedAt ||
      new Date().toISOString();

    const staticPages = [
      {
        loc: `${baseUrl}/`,
        lastmod: formatDate(mostRecentUpdate),
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${baseUrl}/hoved-kategori`,
        lastmod: formatDate(mostRecentUpdate),
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/alle-underkategorier`,
        lastmod: formatDate(mostRecentUpdate),
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/coloring-app`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/blog`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/om-oss`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/kontakt`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/om-skribenten`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/personvernerklaering`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${baseUrl}/vilkar-og-betingelser`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${baseUrl}/lisensieringspolicy`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${baseUrl}/fjerning-av-innhold`,
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
        `${baseUrl}/blog/${post.slug}`,
        formatDate(post._updatedAt),
        "monthly",
        0.7,
      );
    });

    // Add categories
    sitemapData.categories?.forEach((category: SitemapCategory) => {
      xml += generateUrlEntry(
        `${baseUrl}/${category.slug}`,
        formatDate(category._updatedAt),
        "weekly",
        0.8,
      );
    });

    // Add subcategories
    sitemapData.subcategories?.forEach((subcategory: SitemapSubcategory) => {
      xml += generateUrlEntry(
        `${baseUrl}/${subcategory.parentCategorySlug}/${subcategory.slug}`,
        formatDate(subcategory._updatedAt),
        "weekly",
        0.7,
      );
    });

    // Add drawings
    sitemapData.drawings?.forEach((drawing: SitemapDrawing) => {
      xml += generateUrlEntry(
        `${baseUrl}/${drawing.parentCategorySlug}/${drawing.subcategorySlug}/${drawing.slug}`,
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