import { NextResponse } from "next/server";

const { NEXT_PUBLIC_BASE_URL } = process.env;

export async function GET() {
  const currentDate = new Date().toISOString().split("T")[0];

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${NEXT_PUBLIC_BASE_URL}/pages-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${NEXT_PUBLIC_BASE_URL}/image-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
} 