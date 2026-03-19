require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function verifySitemapDuplicates() {
  console.log('=== VERIFYING SITEMAP FOR DUPLICATES ===\n');
  console.log('Simulating what will appear in pages-sitemap.xml...\n');

  // This is the exact query used in pages-sitemap.xml/route.ts for Norwegian pages
  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" &&
      defined(slug.current) &&
      defined(subcategory->slug.current) &&
      defined(subcategory->parentCategory->slug.current) &&
      isActive == true &&
      language == "no" &&
      !(_id in path("drafts.**"))] {
      _id,
      "slug": slug.current,
      "subcategorySlug": subcategory->slug.current,
      "parentCategorySlug": subcategory->parentCategory->slug.current,
      _updatedAt
    }
  `);

  console.log(`Total Norwegian drawings in sitemap: ${norwegianDrawings.length}\n`);

  // Build URLs (exactly as done in sitemap)
  const urls = norwegianDrawings.map(drawing => {
    return `/${drawing.parentCategorySlug}/${drawing.subcategorySlug}/${drawing.slug}`;
  });

  // Check for duplicates
  const urlCounts = {};
  urls.forEach(url => {
    urlCounts[url] = (urlCounts[url] || 0) + 1;
  });

  const duplicateUrls = Object.entries(urlCounts).filter(([url, count]) => count > 1);

  if (duplicateUrls.length === 0) {
    console.log('✅ SUCCESS! No duplicate URLs found in sitemap!\n');
    console.log('🎉 All URLs are unique. Google will no longer see duplicates.\n');
  } else {
    console.log(`⚠️  WARNING: Found ${duplicateUrls.length} duplicate URLs:\n`);
    duplicateUrls.forEach(([url, count]) => {
      console.log(`   ${url} - appears ${count} times`);
    });
    console.log('');
  }

  // Additional verification: check for slugs with -2, -3 suffixes
  const renamedSlugs = norwegianDrawings.filter(d =>
    d.slug.match(/-\d+$/)
  );

  console.log(`\nRenamed slugs (with -2, -3 suffixes): ${renamedSlugs.length}`);
  if (renamedSlugs.length > 0) {
    console.log('Sample of renamed slugs:');
    renamedSlugs.slice(0, 10).forEach(d => {
      console.log(`   - ${d.slug}`);
    });
    if (renamedSlugs.length > 10) {
      console.log(`   ... and ${renamedSlugs.length - 10} more`);
    }
  }

  // Check URL uniqueness percentage
  const uniqueUrls = new Set(urls).size;
  const totalUrls = urls.length;
  const uniquePercentage = ((uniqueUrls / totalUrls) * 100).toFixed(2);

  console.log(`\n=== SITEMAP STATISTICS ===`);
  console.log(`Total URLs: ${totalUrls}`);
  console.log(`Unique URLs: ${uniqueUrls}`);
  console.log(`Duplicate URLs: ${totalUrls - uniqueUrls}`);
  console.log(`Uniqueness: ${uniquePercentage}%\n`);

  if (uniquePercentage === '100.00') {
    console.log('✅ PERFECT! 100% unique URLs in sitemap.\n');
    console.log('=== NEXT STEPS ===\n');
    console.log('1. ✅ All duplicate URLs have been fixed');
    console.log('2. The sitemap will automatically regenerate on next request');
    console.log('3. Submit sitemap to Google Search Console:');
    console.log('   - Go to: https://search.google.com/search-console');
    console.log('   - Navigate to: Sitemaps');
    console.log('   - Add/resubmit: https://tegnogfarge.no/sitemap.xml');
    console.log('4. Wait 1-2 weeks for Google to re-crawl and update index');
    console.log('5. The "Duplicate, Google chose different canonical" errors should disappear\n');
  }
}

verifySitemapDuplicates().catch(console.error);
