require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function checkHreflangMatching() {
  console.log('=== CHECKING HREFLANG MATCHING ===\n');

  // Fetch Norwegian and Swedish drawings (same query as sitemap)
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
      title
    }
  `);

  console.log(`Norwegian drawings: ${norwegianDrawings.length}`);
  console.log(`Swedish drawings: ${swedishDrawings.length}\n`);

  // Try matching by _id (current approach)
  let matchedById = 0;
  norwegianDrawings.forEach(no => {
    const svMatch = swedishDrawings.find(sv => sv._id === no._id);
    if (svMatch) matchedById++;
  });

  console.log('=== MATCHING BY _id (Current Approach) ===');
  console.log(`Norwegian drawings with Swedish match: ${matchedById}`);
  console.log(`Norwegian drawings WITHOUT Swedish match: ${norwegianDrawings.length - matchedById}`);
  console.log(`Match rate: ${((matchedById / norwegianDrawings.length) * 100).toFixed(2)}%\n`);

  // Try matching by slug (potential fix)
  let matchedBySlug = 0;
  const slugMatches = [];
  norwegianDrawings.forEach(no => {
    const svMatch = swedishDrawings.find(sv => sv.slug === no.slug);
    if (svMatch) {
      matchedBySlug++;
      if (slugMatches.length < 5) {
        slugMatches.push({ no, sv: svMatch });
      }
    }
  });

  console.log('=== MATCHING BY SLUG (Potential Fix) ===');
  console.log(`Norwegian drawings with Swedish match: ${matchedBySlug}`);
  console.log(`Norwegian drawings WITHOUT Swedish match: ${norwegianDrawings.length - matchedBySlug}`);
  console.log(`Match rate: ${((matchedBySlug / norwegianDrawings.length) * 100).toFixed(2)}%\n`);

  if (slugMatches.length > 0) {
    console.log('Sample matches by slug:\n');
    slugMatches.forEach((match, i) => {
      console.log(`${i + 1}. Norwegian: ${match.no.title} (${match.no._id})`);
      console.log(`   Slug: ${match.no.slug}`);
      console.log(`   Swedish: ${match.sv.title} (${match.sv._id})`);
      console.log(`   Slug: ${match.sv.slug}\n`);
    });
  }

  console.log('=== ANALYSIS ===\n');

  if (matchedById === 0) {
    console.log('❌ PROBLEM CONFIRMED: No drawings match by _id');
    console.log('   Norwegian and Swedish drawings are separate documents with different IDs.\n');
  }

  if (matchedBySlug > 0) {
    console.log(`✅ POTENTIAL FIX: Matching by slug works for ${matchedBySlug} drawings`);
    console.log('   This suggests drawings were created with matching slugs.\n');
  }

  console.log('=== RECOMMENDATION ===\n');
  console.log('The hreflang matching should be changed from matching by _id to:');
  console.log('1. Match by slug + category + subcategory (full URL path)');
  console.log('2. This will create proper hreflang links between NO/SV versions');
  console.log('3. Pages without a translation will only have self-referencing hreflang\n');
}

checkHreflangMatching().catch(console.error);
