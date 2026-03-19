require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function investigateDuplicateIssue() {
  console.log('=== INVESTIGATING GOOGLE DUPLICATE CANONICAL ISSUE ===\n');

  // The affected URLs from Google Search Console
  const affectedSlugs = [
    'nissen-kjorer-slede-med-gaver',
    'venner-lager-sandslott-sammen',
    'venner-baerer-leker-sammen',
    'venner-lager-en-magisk-drikk',
    'venner-maler-ansikt-pa-hverandre',
    'venner-hjelper-hverandre-over-bekken',
    'venner-leser-sammen-i-telt',
    'venner-planter-blomster-sammen',
    'venner-vanner-blomster-sammen'
  ];

  console.log('Step 1: Checking if these drawings exist in Sanity...\n');

  for (const slug of affectedSlugs) {
    const drawings = await client.fetch(`
      *[_type == "drawingImage" && slug.current == $slug] {
        _id,
        title,
        "slug": slug.current,
        language,
        isActive,
        baseDocumentId,
        "subcategorySlug": subcategory->slug.current,
        "subcategoryTitle": subcategory->title,
        "categorySlug": subcategory->parentCategory->slug.current,
        "categoryTitle": subcategory->parentCategory->title
      }
    `, { slug });

    console.log(`\n📄 Drawing: "${slug}"`);
    if (drawings.length === 0) {
      console.log('   ❌ NOT FOUND in Sanity');
    } else if (drawings.length === 1) {
      console.log('   ✅ Found 1 document:');
      console.log(`      ID: ${drawings[0]._id}`);
      console.log(`      Title: ${drawings[0].title}`);
      console.log(`      Language: ${drawings[0].language || 'NOT SET (null/undefined)'}`);
      console.log(`      Active: ${drawings[0].isActive}`);
      console.log(`      URL: /${drawings[0].categorySlug}/${drawings[0].subcategorySlug}/${drawings[0].slug}`);
      console.log(`      Base Doc ID: ${drawings[0].baseDocumentId || 'NOT SET'}`);
    } else {
      console.log(`   ⚠️  MULTIPLE DOCUMENTS FOUND (${drawings.length}):`);
      drawings.forEach((drawing, i) => {
        console.log(`\n      Document ${i + 1}:`);
        console.log(`      ID: ${drawing._id}`);
        console.log(`      Title: ${drawing.title}`);
        console.log(`      Language: ${drawing.language || 'NOT SET (null/undefined)'}`);
        console.log(`      Active: ${drawing.isActive}`);
        console.log(`      URL: /${drawing.categorySlug}/${drawing.subcategorySlug}/${drawing.slug}`);
        console.log(`      Base Doc ID: ${drawing.baseDocumentId || 'NOT SET'}`);
      });
    }
  }

  console.log('\n\n=== Step 2: Checking language field distribution across ALL drawings ===\n');

  const languageStats = await client.fetch(`
    {
      "total": count(*[_type == "drawingImage"]),
      "withLanguageNo": count(*[_type == "drawingImage" && language == "no"]),
      "withLanguageSv": count(*[_type == "drawingImage" && language == "sv"]),
      "withoutLanguage": count(*[_type == "drawingImage" && !defined(language)]),
      "languageNull": count(*[_type == "drawingImage" && language == null]),
      "active": count(*[_type == "drawingImage" && isActive == true]),
      "activeWithLanguage": count(*[_type == "drawingImage" && isActive == true && defined(language)]),
      "activeWithoutLanguage": count(*[_type == "drawingImage" && isActive == true && !defined(language)])
    }
  `);

  console.log('Language Field Statistics:');
  console.log(`   Total drawings: ${languageStats.total}`);
  console.log(`   With language="no": ${languageStats.withLanguageNo}`);
  console.log(`   With language="sv": ${languageStats.withLanguageSv}`);
  console.log(`   Without language (undefined): ${languageStats.withoutLanguage}`);
  console.log(`   With language=null: ${languageStats.languageNull}`);
  console.log(`\n   Active drawings: ${languageStats.active}`);
  console.log(`   Active WITH language set: ${languageStats.activeWithLanguage}`);
  console.log(`   Active WITHOUT language set: ${languageStats.activeWithoutLanguage}`);

  console.log('\n\n=== Step 3: Testing sitemap query (getSitemapPageData) ===\n');

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

  const allActiveData = await client.fetch(`
    {
      "drawings": *[_type == "drawingImage" && defined(slug.current) && defined(subcategory->slug.current) && defined(subcategory->parentCategory->slug.current) && isActive == true && !(_id in path("drafts.**"))] {
        _id,
        "slug": slug.current,
        language,
        "subcategorySlug": subcategory->slug.current,
        "parentCategorySlug": subcategory->parentCategory->slug.current,
        _updatedAt
      }
    }
  `);

  console.log(`Sitemap query WITH language filter (language == "no"):`);
  console.log(`   Returns: ${norwegianData.drawings.length} drawings`);

  console.log(`\nSitemap query WITHOUT language filter:`);
  console.log(`   Returns: ${allActiveData.drawings.length} drawings`);
  console.log(`   Difference: ${allActiveData.drawings.length - norwegianData.drawings.length} drawings excluded by language filter`);

  // Check if affected drawings are in the sitemap results
  console.log('\n\n=== Step 4: Are the affected drawings in the sitemap? ===\n');

  for (const slug of affectedSlugs) {
    const inNorwegianSitemap = norwegianData.drawings.some(d => d.slug === slug);
    const inAllActiveSitemap = allActiveData.drawings.some(d => d.slug === slug);

    console.log(`📄 "${slug}":`);
    console.log(`   In Norwegian sitemap (language == "no"): ${inNorwegianSitemap ? '✅ YES' : '❌ NO'}`);
    console.log(`   In all active drawings: ${inAllActiveSitemap ? '✅ YES' : '❌ NO'}`);

    if (inAllActiveSitemap && !inNorwegianSitemap) {
      const drawing = allActiveData.drawings.find(d => d.slug === slug);
      console.log(`   ⚠️  EXCLUDED BY LANGUAGE FILTER - language="${drawing.language || 'undefined'}"`);
    }
  }

  console.log('\n\n=== Step 5: Check for duplicate slugs (different IDs, same slug) ===\n');

  const duplicateSlugs = await client.fetch(`
    *[_type == "drawingImage" && isActive == true] {
      _id,
      "slug": slug.current,
      language,
      title
    } | order(slug asc)
  `);

  const slugMap = {};
  duplicateSlugs.forEach(drawing => {
    if (!slugMap[drawing.slug]) {
      slugMap[drawing.slug] = [];
    }
    slugMap[drawing.slug].push(drawing);
  });

  const duplicates = Object.entries(slugMap).filter(([slug, drawings]) => drawings.length > 1);

  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} slugs with multiple active documents:\n`);
    duplicates.slice(0, 10).forEach(([slug, drawings]) => {
      console.log(`   Slug: "${slug}" (${drawings.length} documents)`);
      drawings.forEach(d => {
        console.log(`      - ID: ${d._id}, Language: ${d.language || 'NOT SET'}, Title: ${d.title}`);
      });
    });
    if (duplicates.length > 10) {
      console.log(`   ... and ${duplicates.length - 10} more`);
    }
  } else {
    console.log('✅ No duplicate slugs found');
  }

  console.log('\n\n=== Step 6: Check _id presence in sitemap data ===\n');

  const sampleDrawing = norwegianData.drawings[0];
  if (sampleDrawing) {
    console.log('Sample drawing from sitemap query:');
    console.log(JSON.stringify(sampleDrawing, null, 2));
    console.log(`\n_id field present: ${sampleDrawing._id ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log('❌ No drawings returned from Norwegian sitemap query');
  }

  console.log('\n\n=== INVESTIGATION COMPLETE ===\n');
}

investigateDuplicateIssue().catch(console.error);
