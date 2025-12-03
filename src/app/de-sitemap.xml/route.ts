import { NextResponse } from "next/server";
import { getSitemapPageData } from "@/lib/sanity";
import { STRUCTURED_DATA } from "@/lib/structured-data-constants";
import type {
  SitemapPageData,
  SitemapCategory,
  SitemapSubcategory,
  SitemapDrawing,
} from "@/types";

// Helper to format date
function formatDate(dateString: string) {
  return new Date(dateString).toISOString().split("T")[0];
}

// Helper to generate a URL entry (simple, no hreflang)
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

    // Fetch ONLY German content
    const germanData: SitemapPageData = await getSitemapPageData('de');

    const currentDate = formatDate(new Date().toISOString());

    const mostRecentUpdate =
      germanData.drawings?.[0]?._updatedAt ||
      new Date().toISOString();

    // Static pages that exist in German
    const staticPages = [
      {
        loc: `${baseUrl}/de/`,
        lastmod: formatDate(mostRecentUpdate),
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: `${baseUrl}/de/hauptkategorie`,
        lastmod: formatDate(mostRecentUpdate),
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/de/alle-unterkategorien`,
        lastmod: formatDate(mostRecentUpdate),
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/de/coloring-app`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/de/blog`,
        lastmod: currentDate,
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/de/om-oss`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/de/kontakt`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/de/ueber-den-autor`,
        lastmod: "2024-05-20",
        changefreq: "monthly",
        priority: 0.7,
      },
      {
        loc: `${baseUrl}/de/datenschutzerklaerung`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${baseUrl}/de/allgemeine-geschaeftsbedingungen`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${baseUrl}/de/lizenzrichtlinien`,
        lastmod: "2024-05-20",
        changefreq: "yearly",
        priority: 0.5,
      },
      {
        loc: `${baseUrl}/de/entfernung-von-inhalten`,
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

    // Add German categories
    germanData.categories?.forEach((category: SitemapCategory) => {
      xml += generateUrlEntry(
        `${baseUrl}/de/${category.slug}`,
        formatDate(category._updatedAt),
        "weekly",
        0.8,
      );
    });

    // Add German subcategories
    germanData.subcategories?.forEach((subcategory: SitemapSubcategory) => {
      xml += generateUrlEntry(
        `${baseUrl}/de/${subcategory.parentCategorySlug}/${subcategory.slug}`,
        formatDate(subcategory._updatedAt),
        "weekly",
        0.7,
      );
    });

    // Add German drawings
    germanData.drawings?.forEach((drawing: SitemapDrawing) => {
      xml += generateUrlEntry(
        `${baseUrl}/de/${drawing.parentCategorySlug}/${drawing.subcategorySlug}/${drawing.slug}`,
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
    console.error("Error generating German sitemap:", error);

    // Return proper XML error instead of plain text
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap -->
</urlset>`;

    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
