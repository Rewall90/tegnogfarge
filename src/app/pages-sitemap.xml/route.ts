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

// Helper to generate hreflang links with actual slugs from all locales
function generateMultilingualHreflangLinks(
  baseUrl: string,
  noSlug: string,
  svSlug: string,
  deSlug: string | null = null
) {
  let hreflangLinks = '';

  // Norwegian version (using ISO 639-1 'nb' for Norwegian Bokmål)
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="nb" href="${baseUrl}${noSlug}"/>`;

  // Swedish version
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="sv" href="${baseUrl}/sv${svSlug}"/>`;

  // German version (if exists)
  if (deSlug) {
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}/de${deSlug}"/>`;
  }

  // x-default points to Norwegian
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noSlug}"/>`;

  return hreflangLinks;
}

// Helper to generate hreflang links for static pages (same slugs in all languages)
function generateHreflangLinks(baseUrl: string, path: string) {
  let hreflangLinks = '';

  // Map internal locale codes to ISO 639-1 compliant hreflang codes
  const hreflangMapping: Record<string, string> = {
    'no': 'nb',  // Norwegian Bokmål
    'sv': 'sv',  // Swedish
    'de': 'de',  // German
  };

  for (const locale of locales) {
    const url = locale === 'no' ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
    const hreflangCode = hreflangMapping[locale] || locale;
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="${hreflangCode}" href="${url}"/>`;
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

    // ✅ FIX: Fetch Norwegian, Swedish, and German content
    const norwegianData: SitemapPageData = await getSitemapPageData('no');
    const swedishData: SitemapPageData = await getSitemapPageData('sv');
    const germanData: SitemapPageData = await getSitemapPageData('de');

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

    // ✅ FIX: Add categories with proper Norwegian-Swedish-German matching
    norwegianData.categories?.forEach((noCategory: SitemapCategory) => {
      // Find matching Swedish and German categories by slug
      const svCategory = swedishData.categories?.find(
        (sv: SitemapCategory) => sv.slug === noCategory.slug
      );
      const deCategory = germanData.categories?.find(
        (de: SitemapCategory) => de.slug === noCategory.slug
      );

      if (svCategory) {
        // Use actual slugs from each language
        const noPath = `/${noCategory.slug}`;
        const svPath = `/${svCategory.slug}`;
        const dePath = deCategory ? `/${deCategory.slug}` : null;
        const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath, dePath);

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
    <xhtml:link rel="alternate" hreflang="nb" href="${baseUrl}${noPath}"/>
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

    // ✅ FIX: Add subcategories with proper Norwegian-Swedish-German matching
    norwegianData.subcategories?.forEach((noSubcategory: SitemapSubcategory) => {
      // Find matching Swedish and German subcategories by slug and parent category slug
      const svSubcategory = swedishData.subcategories?.find(
        (sv: SitemapSubcategory) =>
          sv.slug === noSubcategory.slug &&
          sv.parentCategorySlug === noSubcategory.parentCategorySlug
      );
      const deSubcategory = germanData.subcategories?.find(
        (de: SitemapSubcategory) =>
          de.slug === noSubcategory.slug &&
          de.parentCategorySlug === noSubcategory.parentCategorySlug
      );

      if (svSubcategory) {
        // Use actual slugs from each language
        const noPath = `/${noSubcategory.parentCategorySlug}/${noSubcategory.slug}`;
        const svPath = `/${svSubcategory.parentCategorySlug}/${svSubcategory.slug}`;
        const dePath = deSubcategory ? `/${deSubcategory.parentCategorySlug}/${deSubcategory.slug}` : null;
        const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath, dePath);

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
    <xhtml:link rel="alternate" hreflang="nb" href="${baseUrl}${noPath}"/>
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

    // ✅ FIX: Add drawings with proper Norwegian-Swedish-German matching
    norwegianData.drawings?.forEach((noDrawing: SitemapDrawing) => {
      // Find matching Swedish and German drawings by full URL path (category + subcategory + slug)
      const svDrawing = swedishData.drawings?.find(
        (sv: SitemapDrawing) =>
          sv.slug === noDrawing.slug &&
          sv.subcategorySlug === noDrawing.subcategorySlug &&
          sv.parentCategorySlug === noDrawing.parentCategorySlug
      );
      const deDrawing = germanData.drawings?.find(
        (de: SitemapDrawing) =>
          de.slug === noDrawing.slug &&
          de.subcategorySlug === noDrawing.subcategorySlug &&
          de.parentCategorySlug === noDrawing.parentCategorySlug
      );

      if (svDrawing) {
        // Use actual slugs from each language
        const noPath = `/${noDrawing.parentCategorySlug}/${noDrawing.subcategorySlug}/${noDrawing.slug}`;
        const svPath = `/${svDrawing.parentCategorySlug}/${svDrawing.subcategorySlug}/${svDrawing.slug}`;
        const dePath = deDrawing ? `/${deDrawing.parentCategorySlug}/${deDrawing.subcategorySlug}/${deDrawing.slug}` : null;
        const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath, dePath);

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
    <xhtml:link rel="alternate" hreflang="nb" href="${baseUrl}${noPath}"/>
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
