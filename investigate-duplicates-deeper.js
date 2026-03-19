require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function investigateDuplicatesDeeper() {
  console.log('=== DEEP DIVE INTO DUPLICATE SLUGS ===\n');

  console.log('Step 1: Analyzing the nature of duplicates...\n');

  const allDrawings = await client.fetch(`
    *[_type == "drawingImage" && isActive == true] {
      _id,
      "slug": slug.current,
      language,
      title,
      "categorySlug": subcategory->parentCategory->slug.current,
      "subcategorySlug": subcategory->slug.current
    } | order(slug asc)
  `);

  // Group by slug
  const slugMap = {};
  allDrawings.forEach(drawing => {
    if (!slugMap[drawing.slug]) {
      slugMap[drawing.slug] = [];
    }
    slugMap[drawing.slug].push(drawing);
  });

  const duplicates = Object.entries(slugMap).filter(([slug, drawings]) => drawings.length > 1);

  console.log(`Total active drawings: ${allDrawings.length}`);
  console.log(`Unique slugs: ${Object.keys(slugMap).length}`);
  console.log(`Duplicate slugs: ${duplicates.length}\n`);

  // Categorize duplicates
  let sameLanguageDuplicates = 0;
  let crossLanguageDuplicates = 0;
  let sameCategoryDuplicates = 0;
  let differentCategoryDuplicates = 0;

  const exampleSameLanguage = [];
  const exampleCrossLanguage = [];
  const exampleDifferentCategory = [];

  duplicates.forEach(([slug, drawings]) => {
    const languages = [...new Set(drawings.map(d => d.language))];
    const categories = [...new Set(drawings.map(d => `${d.categorySlug}/${d.subcategorySlug}`))];

    if (languages.length === 1 && languages[0] === 'no') {
      sameLanguageDuplicates++;
      if (exampleSameLanguage.length < 3) {
        exampleSameLanguage.push({ slug, drawings });
      }
    }

    if (languages.length > 1) {
      crossLanguageDuplicates++;
      if (exampleCrossLanguage.length < 3) {
        exampleCrossLanguage.push({ slug, drawings });
      }
    }

    if (categories.length === 1) {
      sameCategoryDuplicates++;
    } else {
      differentCategoryDuplicates++;
      if (exampleDifferentCategory.length < 3) {
        exampleDifferentCategory.push({ slug, drawings });
      }
    }
  });

  console.log('Duplicate Categories:');
  console.log(`   Same language duplicates (both "no"): ${sameLanguageDuplicates}`);
  console.log(`   Cross-language duplicates (no + sv): ${crossLanguageDuplicates}`);
  console.log(`   Same category/subcategory: ${sameCategoryDuplicates}`);
  console.log(`   Different categories: ${differentCategoryDuplicates}\n`);

  console.log('\n=== Examples of SAME LANGUAGE duplicates (Norwegian only) ===\n');
  exampleSameLanguage.forEach(({ slug, drawings }) => {
    console.log(`Slug: "${slug}"`);
    drawings.forEach(d => {
      console.log(`   - ID: ${d._id}`);
      console.log(`     Language: ${d.language}`);
      console.log(`     Title: ${d.title}`);
      console.log(`     Path: /${d.categorySlug}/${d.subcategorySlug}/${d.slug}`);
    });
    console.log('');
  });

  console.log('\n=== Examples of CROSS-LANGUAGE duplicates ===\n');
  exampleCrossLanguage.forEach(({ slug, drawings }) => {
    console.log(`Slug: "${slug}"`);
    drawings.forEach(d => {
      console.log(`   - ID: ${d._id}`);
      console.log(`     Language: ${d.language}`);
      console.log(`     Title: ${d.title}`);
      console.log(`     Path: /${d.categorySlug}/${d.subcategorySlug}/${d.slug}`);
    });
    console.log('');
  });

  console.log('\n=== Examples of DIFFERENT CATEGORY duplicates ===\n');
  exampleDifferentCategory.forEach(({ slug, drawings }) => {
    console.log(`Slug: "${slug}"`);
    drawings.forEach(d => {
      console.log(`   - ID: ${d._id}`);
      console.log(`     Language: ${d.language}`);
      console.log(`     Title: ${d.title}`);
      console.log(`     Path: /${d.categorySlug}/${d.subcategorySlug}/${d.slug}`);
    });
    console.log('');
  });

  console.log('\n=== Step 2: Check the specific Christmas drawing with 3 duplicates ===\n');

  const christmasDrawing = await client.fetch(`
    *[_type == "drawingImage" && slug.current == "nissen-kjorer-slede-med-gaver"] {
      _id,
      _createdAt,
      _updatedAt,
      title,
      "slug": slug.current,
      language,
      isActive,
      "categorySlug": subcategory->parentCategory->slug.current,
      "categoryTitle": subcategory->parentCategory->title,
      "subcategorySlug": subcategory->slug.current,
      "subcategoryTitle": subcategory->title
    } | order(_createdAt asc)
  `);

  console.log('All versions of "nissen-kjorer-slede-med-gaver":');
  christmasDrawing.forEach((d, i) => {
    console.log(`\n   Version ${i + 1}:`);
    console.log(`   ID: ${d._id}`);
    console.log(`   Created: ${d._createdAt}`);
    console.log(`   Updated: ${d._updatedAt}`);
    console.log(`   Language: ${d.language}`);
    console.log(`   Active: ${d.isActive}`);
    console.log(`   Category: ${d.categoryTitle} (${d.categorySlug})`);
    console.log(`   Subcategory: ${d.subcategoryTitle} (${d.subcategorySlug})`);
    console.log(`   URL: /${d.categorySlug}/${d.subcategorySlug}/${d.slug}`);
  });

  console.log('\n\n=== Step 3: Check sitemap output for these duplicates ===\n');

  const sitemapData = await client.fetch(`
    {
      "drawings": *[_type == "drawingImage" && defined(slug.current) && defined(subcategory->slug.current) && defined(subcategory->parentCategory->slug.current) && isActive == true && language == "no" && !(_id in path("drafts.**"))] {
        _id,
        "slug": slug.current,
        "subcategorySlug": subcategory->slug.current,
        "parentCategorySlug": subcategory->parentCategory->slug.current,
        _updatedAt
      }
    }
  `);

  const christmasInSitemap = sitemapData.drawings.filter(d => d.slug === 'nissen-kjorer-slede-med-gaver');

  console.log(`Drawings with slug "nissen-kjorer-slede-med-gaver" in sitemap: ${christmasInSitemap.length}`);
  christmasInSitemap.forEach((d, i) => {
    console.log(`\n   Sitemap entry ${i + 1}:`);
    console.log(`   ID: ${d._id}`);
    console.log(`   URL: /${d.parentCategorySlug}/${d.subcategorySlug}/${d.slug}`);
  });

  console.log('\n\n=== Step 4: Impact on hreflang matching ===\n');

  // Simulate what happens in pages-sitemap.xml route
  const norwegianData = await client.fetch(`
    {
      "drawings": *[_type == "drawingImage" && defined(slug.current) && defined(subcategory->slug.current) && defined(subcategory->parentCategory->slug.current) && isActive == true && language == "no" && !(_id in path("drafts.**"))] {
        _id,
        "slug": slug.current,
        "subcategorySlug": subcategory->slug.current,
        "parentCategorySlug": subcategory->parentCategory->slug.current,
        _updatedAt
      }
    }
  `);

  const swedishData = await client.fetch(`
    {
      "drawings": *[_type == "drawingImage" && defined(slug.current) && defined(subcategory->slug.current) && defined(subcategory->parentCategory->slug.current) && isActive == true && language == "sv" && !(_id in path("drafts.**"))] {
        _id,
        "slug": slug.current,
        "subcategorySlug": subcategory->slug.current,
        "parentCategorySlug": subcategory->parentCategory->slug.current,
        _updatedAt
      }
    }
  `);

  console.log(`Norwegian drawings in sitemap: ${norwegianData.drawings.length}`);
  console.log(`Swedish drawings in sitemap: ${swedishData.drawings.length}`);

  // Check how many would have hreflang pairs
  let withPairs = 0;
  let withoutPairs = 0;

  norwegianData.drawings.forEach(noDrawing => {
    const svDrawing = swedishData.drawings.find(sv => sv._id === noDrawing._id);
    if (svDrawing) {
      withPairs++;
    } else {
      withoutPairs++;
    }
  });

  console.log(`\nHreflang matching (by _id):`);
  console.log(`   Norwegian drawings WITH Swedish pair: ${withPairs}`);
  console.log(`   Norwegian drawings WITHOUT Swedish pair: ${withoutPairs}`);
  console.log(`   Percentage with pairs: ${((withPairs / norwegianData.drawings.length) * 100).toFixed(2)}%`);

  console.log('\n\n=== INVESTIGATION COMPLETE ===\n');
}

investigateDuplicatesDeeper().catch(console.error);
