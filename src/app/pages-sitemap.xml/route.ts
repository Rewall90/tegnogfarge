import { NextResponse } from "next/server";
import { getSitemapPageData, getTranslatedSlugsForSitemap } from "@/lib/sanity";
import { STRUCTURED_DATA } from "@/lib/structured-data-constants";
import type {
  SitemapPageData,
  SitemapPost,
} from "@/types";

// Helper to format date
function formatDate(dateString: string) {
  return new Date(dateString).toISOString().split("T")[0];
}

/**
 * Static page slug mapping for hreflang in sitemap.
 * Maps Norwegian paths to their Swedish and German equivalents.
 */
const staticPageSlugMap: Record<string, { sv: string; de: string }> = {
  '/': { sv: '/sv/', de: '/de/' },
  '/hoved-kategori': { sv: '/sv/huvudkategori', de: '/de/hauptkategorie' },
  '/alle-underkategorier': { sv: '/sv/alla-underkategorier', de: '/de/alle-unterkategorien' },
  '/coloring-app': { sv: '/sv/coloring-app', de: '/de/coloring-app' },
  '/blog': { sv: '/sv/blog', de: '/de/blog' },
  '/om-oss': { sv: '/sv/om-oss', de: '/de/ueber-uns' },
  '/kontakt': { sv: '/sv/kontakt', de: '/de/kontakt' },
  '/om-skribenten': { sv: '/sv/om-forfattaren', de: '/de/ueber-den-autor' },
  '/personvernerklaering': { sv: '/sv/sekretesspolicy', de: '/de/datenschutzerklaerung' },
  '/vilkar-og-betingelser': { sv: '/sv/villkor-och-bestammelser', de: '/de/allgemeine-geschaeftsbedingungen' },
  '/lisensieringspolicy': { sv: '/sv/licenspolicy', de: '/de/lizenzrichtlinien' },
  '/fjerning-av-innhold': { sv: '/sv/borttagning-av-innehall', de: '/de/entfernung-von-inhalten' },
};

// Helper to generate hreflang links for static pages with proper translated slugs
function generateStaticHreflangLinks(baseUrl: string, noPath: string) {
  const mapping = staticPageSlugMap[noPath];
  let hreflangLinks = '';

  // Norwegian (self)
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="nb" href="${baseUrl}${noPath}"/>`;

  if (mapping) {
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="sv" href="${baseUrl}${mapping.sv}"/>`;
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}${mapping.de}"/>`;
  }

  // x-default points to Norwegian
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noPath}"/>`;

  return hreflangLinks;
}

// Helper to generate hreflang links with actual slugs from all locales
function generateMultilingualHreflangLinks(
  baseUrl: string,
  noSlug: string,
  svSlug: string | null,
  deSlug: string | null
) {
  let hreflangLinks = '';

  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="nb" href="${baseUrl}${noSlug}"/>`;

  if (svSlug) {
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="sv" href="${baseUrl}/sv${svSlug}"/>`;
  }

  if (deSlug) {
    hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}/de${deSlug}"/>`;
  }

  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${noSlug}"/>`;

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

    // Fetch Norwegian posts for blog section
    const norwegianData: SitemapPageData = await getSitemapPageData('no');

    // Fetch translated slugs via baseDocumentId matching
    const [translatedCategories, translatedSubcategories, translatedDrawings] = await Promise.all([
      getTranslatedSlugsForSitemap('category'),
      getTranslatedSlugsForSitemap('subcategory'),
      getTranslatedSlugsForSitemap('drawingImage'),
    ]);

    const currentDate = formatDate(new Date().toISOString());

    const mostRecentUpdate =
      norwegianData.posts?.[0]?._updatedAt ||
      norwegianData.drawings?.[0]?._updatedAt ||
      new Date().toISOString();

    const staticPages = [
      { path: '/', lastmod: formatDate(mostRecentUpdate), changefreq: "daily", priority: 1.0 },
      { path: '/hoved-kategori', lastmod: formatDate(mostRecentUpdate), changefreq: "weekly", priority: 0.8 },
      { path: '/alle-underkategorier', lastmod: formatDate(mostRecentUpdate), changefreq: "weekly", priority: 0.8 },
      { path: '/coloring-app', lastmod: currentDate, changefreq: "monthly", priority: 0.8 },
      { path: '/blog', lastmod: currentDate, changefreq: "weekly", priority: 0.8 },
      { path: '/om-oss', lastmod: "2024-05-20", changefreq: "monthly", priority: 0.7 },
      { path: '/kontakt', lastmod: "2024-05-20", changefreq: "monthly", priority: 0.7 },
      { path: '/om-skribenten', lastmod: "2024-05-20", changefreq: "monthly", priority: 0.7 },
      { path: '/personvernerklaering', lastmod: "2024-05-20", changefreq: "yearly", priority: 0.5 },
      { path: '/vilkar-og-betingelser', lastmod: "2024-05-20", changefreq: "yearly", priority: 0.5 },
      { path: '/lisensieringspolicy', lastmod: "2024-05-20", changefreq: "yearly", priority: 0.5 },
      { path: '/fjerning-av-innhold', lastmod: "2024-05-20", changefreq: "yearly", priority: 0.5 },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Add static pages with correct translated hreflang links
    staticPages.forEach(page => {
      const hreflangLinks = generateStaticHreflangLinks(baseUrl, page.path);

      xml += generateUrlEntry(
        `${baseUrl}${page.path}`,
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

    // Add categories with baseDocumentId-based matching
    for (const cat of translatedCategories) {
      const noPath = `/${cat.slug}`;
      const svPath = cat.svSlug ? `/${cat.svSlug}` : null;
      const dePath = cat.deSlug ? `/${cat.deSlug}` : null;
      const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath, dePath);

      xml += generateUrlEntry(
        `${baseUrl}${noPath}`,
        formatDate(cat._updatedAt),
        "weekly",
        0.8,
        hreflangLinks,
      );
    }

    // Add subcategories with baseDocumentId-based matching
    for (const sub of translatedSubcategories) {
      const noPath = `/${sub.parentCategorySlug}/${sub.slug}`;
      const svPath = sub.svDoc ? `/${sub.svDoc.parentCategorySlug}/${sub.svDoc.slug}` : null;
      const dePath = sub.deDoc ? `/${sub.deDoc.parentCategorySlug}/${sub.deDoc.slug}` : null;
      const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath, dePath);

      xml += generateUrlEntry(
        `${baseUrl}${noPath}`,
        formatDate(sub._updatedAt),
        "weekly",
        0.7,
        hreflangLinks,
      );
    }

    // Add drawings with baseDocumentId-based matching
    for (const drawing of translatedDrawings) {
      const noPath = `/${drawing.parentCategorySlug}/${drawing.subcategorySlug}/${drawing.slug}`;
      const svPath = drawing.svDoc
        ? `/${drawing.svDoc.parentCategorySlug}/${drawing.svDoc.subcategorySlug}/${drawing.svDoc.slug}`
        : null;
      const dePath = drawing.deDoc
        ? `/${drawing.deDoc.parentCategorySlug}/${drawing.deDoc.subcategorySlug}/${drawing.deDoc.slug}`
        : null;
      const hreflangLinks = generateMultilingualHreflangLinks(baseUrl, noPath, svPath, dePath);

      xml += generateUrlEntry(
        `${baseUrl}${noPath}`,
        formatDate(drawing._updatedAt),
        "monthly",
        0.6,
        hreflangLinks,
      );
    }

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
