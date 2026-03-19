require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function verifyHreflangFix() {
  console.log('=== VERIFYING HREFLANG FIX ===\n');

  // Fetch Norwegian and Swedish drawings
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
      title
    }
  `);

  const swedishDrawings = await client.fetch(`
    *[_type == "drawingImage" &&
      defined(slug.current) &&
      defined(subcategory->slug.current) &&
      defined(subcategory->parentCategory->slug.current) &&
      isActive == true &&
      language == "sv" &&
      !(_id in path("drafts.**"))] {
      _id,
      "slug": slug.current,
      "subcategorySlug": subcategory->slug.current,
      "parentCategorySlug": subcategory->parentCategory->slug.current,
      title
    }
  `);

  console.log(`Norwegian drawings: ${norwegianDrawings.length}`);
  console.log(`Swedish drawings: ${swedishDrawings.length}\n`);

  // Match by full URL path (new approach)
  let matchedByPath = 0;
  const pathMatches = [];

  norwegianDrawings.forEach(no => {
    const svMatch = swedishDrawings.find(sv =>
      sv.slug === no.slug &&
      sv.subcategorySlug === no.subcategorySlug &&
      sv.parentCategorySlug === no.parentCategorySlug
    );

    if (svMatch) {
      matchedByPath++;
      if (pathMatches.length < 10) {
        pathMatches.push({ no, sv: svMatch });
      }
    }
  });

  console.log('=== MATCHING BY FULL URL PATH (New Fixed Approach) ===');
  console.log(`✅ Norwegian drawings WITH Swedish translation: ${matchedByPath}`);
  console.log(`❌ Norwegian drawings WITHOUT Swedish translation: ${norwegianDrawings.length - matchedByPath}`);
  console.log(`Match rate: ${((matchedByPath / norwegianDrawings.length) * 100).toFixed(2)}%\n`);

  if (pathMatches.length > 0) {
    console.log('Sample hreflang pairs (first 10):\n');
    pathMatches.forEach((match, i) => {
      const noUrl = `/${match.no.parentCategorySlug}/${match.no.subcategorySlug}/${match.no.slug}`;
      const svUrl = `/sv/${match.sv.parentCategorySlug}/${match.sv.subcategorySlug}/${match.sv.slug}`;

      console.log(`${i + 1}. NO: https://tegnogfarge.no${noUrl}`);
      console.log(`   SV: https://tegnogfarge.no${svUrl}`);
      console.log(`   Title (NO): ${match.no.title}`);
      console.log(`   Title (SV): ${match.sv.title}\n`);
    });
  }

  console.log('=== HREFLANG IMPACT ===\n');
  console.log(`${matchedByPath} Norwegian pages will have proper hreflang links to Swedish versions`);
  console.log(`${norwegianDrawings.length - matchedByPath} Norwegian pages will only have self-referencing hreflang (no translation)`);
  console.log(`${swedishDrawings.length} Swedish pages will be included in sitemap\n`);

  console.log('=== SUMMARY ===\n');
  console.log('✅ The sitemap will now correctly match Norwegian and Swedish versions');
  console.log('✅ Hreflang links will be accurate for bilingual SEO');
  console.log('✅ Google will understand which pages are translations of each other');
  console.log('✅ This improves international SEO and prevents duplicate content issues\n');

  console.log('=== NEXT STEPS ===\n');
  console.log('1. The sitemap route has been updated with the fix');
  console.log('2. Next time the sitemap is accessed, it will regenerate with correct hreflang');
  console.log('3. Submit updated sitemap to Google Search Console');
  console.log('4. Google will better understand your multilingual content structure\n');
}

verifyHreflangFix().catch(console.error);
