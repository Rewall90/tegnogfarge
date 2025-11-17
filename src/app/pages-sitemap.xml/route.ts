import { NextResponse } from "next/server";
import { getSitemapPageData } from "@/lib/sanity";
import { STRUCTURED_DATA } from "@/lib/structured-data-constants";
import { locales } from "@/i18n";
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

// Helper to generate hreflang links with actual slugs from both locales
function generateMultilingualHreflangLinks(
  baseUrl: string,
  noSlug: string,
  svSlug: string
) {
  let hreflangLinks = '';

  // Norwegian version
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="no" href="${baseUrl}${noSlug}"/>`;

  // Swedish version
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="sv" href="${baseUrl}/sv${svSlug}"/>`;

  // x-default points to Norwegian
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noSlug}"/>`;

  return hreflangLinks;
}

// Helper to generate hreflang links for static pages (same slugs in both languages)
function generateHreflangLinks(baseUrl: string, path: string) {
  let hreflangLinks = '';

  for (const locale of locales) {
    const url = locale === 'no' ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${url}"/>`;
  }

  // Add x-default pointing to Norwegian (default locale)
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path}"/>`;

  return hreflangLinks;
}

// Helper to generate a URL entry with hreflang
function generateUrlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: number,
  hreflangLinks: string = '',
) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflangLinks}
  </url>`;
}

export async function GET() {
  try {
    const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;

    // ✅ FIX: Fetch BOTH Norwegian and Swedish content
    const norwegianData: SitemapPageData = await getSitemapPageData('no');
    const swedishData: SitemapPageData = await getSitemapPageData('sv');

    const currentDate = formatDate(new Date().toISOString());

    const mostRecentUpdate =
      norwegianData.posts?.[0]?._updatedAt ||
      norwegianData.drawings?.[0]?._updatedAt ||
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Add static pages with hreflang (same slugs for both languages)
    staticPages.forEach(page => {
      // Extract path from full URL
      const path = page.loc.replace(baseUrl, '');
      const hreflangLinks = generateHreflangLinks(baseUrl, path);

      xml += generateUrlEntry(
        page.loc,
        page.lastmod,
        page.changefreq,
        page.priority,
        hreflangLinks,
      );
    });

    // Add blog posts (Norwegian only for now)
    norwegianData.posts?.forEach((post: SitemapPost) => {
      xml += generateUrlEntry(
        `${baseUrl}/blog/${post.slug}`,
        formatDate(post._updatedAt),
        "monthly",
        0.7,
      );
    });

    // ✅ FIX: Add categories with proper Norwegian-Swedish matching
    norwegianData.categories?.forEach((noCategory: SitemapCategory) => {
      // Find matching Swedish category by _id (same document, different language)
      const svCategory = swedishData.categories?.find(
        (sv: SitemapCategory) => sv._id === noCategory._id
      );

      if (svCategory) {
        // Use actual slugs from each language
        const noPath = `/${noCategory.slug}`;
        const svPath = `/${svCategory.slug}`;
        const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath);

        xml += generateUrlEntry(
          `${baseUrl}${noPath}`,
          formatDate(noCategory._updatedAt),
          "weekly",
          0.8,
          hreflangLinks,
        );
      } else {
        // If no Swedish version exists, only add Norwegian with fallback to self
        const noPath = `/${noCategory.slug}`;
        const hreflangLinks = `
    <xhtml:link rel="alternate" hreflang="no" href="${baseUrl}${noPath}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noPath}"/>`;

        xml += generateUrlEntry(
          `${baseUrl}${noPath}`,
          formatDate(noCategory._updatedAt),
          "weekly",
          0.8,
          hreflangLinks,
        );
      }
    });

    // ✅ FIX: Add subcategories with proper Norwegian-Swedish matching
    norwegianData.subcategories?.forEach((noSubcategory: SitemapSubcategory) => {
      // Find matching Swedish subcategory by _id
      const svSubcategory = swedishData.subcategories?.find(
        (sv: SitemapSubcategory) => sv._id === noSubcategory._id
      );

      if (svSubcategory) {
        // Use actual slugs from each language
        const noPath = `/${noSubcategory.parentCategorySlug}/${noSubcategory.slug}`;
        const svPath = `/${svSubcategory.parentCategorySlug}/${svSubcategory.slug}`;
        const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath);

        xml += generateUrlEntry(
          `${baseUrl}${noPath}`,
          formatDate(noSubcategory._updatedAt),
          "weekly",
          0.7,
          hreflangLinks,
        );
      } else {
        // If no Swedish version exists, only add Norwegian
        const noPath = `/${noSubcategory.parentCategorySlug}/${noSubcategory.slug}`;
        const hreflangLinks = `
    <xhtml:link rel="alternate" hreflang="no" href="${baseUrl}${noPath}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noPath}"/>`;

        xml += generateUrlEntry(
          `${baseUrl}${noPath}`,
          formatDate(noSubcategory._updatedAt),
          "weekly",
          0.7,
          hreflangLinks,
        );
      }
    });

    // ✅ FIX: Add drawings with proper Norwegian-Swedish matching
    norwegianData.drawings?.forEach((noDrawing: SitemapDrawing) => {
      // Find matching Swedish drawing by _id
      const svDrawing = swedishData.drawings?.find(
        (sv: SitemapDrawing) => sv._id === noDrawing._id
      );

      if (svDrawing) {
        // Use actual slugs from each language
        const noPath = `/${noDrawing.parentCategorySlug}/${noDrawing.subcategorySlug}/${noDrawing.slug}`;
        const svPath = `/${svDrawing.parentCategorySlug}/${svDrawing.subcategorySlug}/${svDrawing.slug}`;
        const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath);

        xml += generateUrlEntry(
          `${baseUrl}${noPath}`,
          formatDate(noDrawing._updatedAt),
          "monthly",
          0.6,
          hreflangLinks,
        );
      } else {
        // If no Swedish version exists, only add Norwegian
        const noPath = `/${noDrawing.parentCategorySlug}/${noDrawing.subcategorySlug}/${noDrawing.slug}`;
        const hreflangLinks = `
    <xhtml:link rel="alternate" hreflang="no" href="${baseUrl}${noPath}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noPath}"/>`;

        xml += generateUrlEntry(
          `${baseUrl}${noPath}`,
          formatDate(noDrawing._updatedAt),
          "monthly",
          0.6,
          hreflangLinks,
        );
      }
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
