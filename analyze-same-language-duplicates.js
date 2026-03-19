require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function analyzeSameLanguageDuplicates() {
  console.log('=== ANALYZING SAME-LANGUAGE DUPLICATES ===\n');
  console.log('Goal: Find all Norwegian duplicates and categorize them for fixing\n');

  // Get all active Norwegian drawings
  const norwegianDrawings = await client.fetch(`
    *[_type == "drawingImage" && isActive == true && language == "no"] {
      _id,
      _createdAt,
      _updatedAt,
      title,
      "slug": slug.current,
      "categorySlug": subcategory->parentCategory->slug.current,
      "categoryTitle": subcategory->parentCategory->title,
      "subcategorySlug": subcategory->slug.current,
      "subcategoryTitle": subcategory->title,
      downloadCount,
      "isDraft": _id in path("drafts.**")
    } | order(slug asc, _createdAt asc)
  `);

  console.log(`Total Norwegian drawings: ${norwegianDrawings.length}\n`);

  // Group by slug
  const slugMap = {};
  norwegianDrawings.forEach(drawing => {
    if (!slugMap[drawing.slug]) {
      slugMap[drawing.slug] = [];
    }
    slugMap[drawing.slug].push(drawing);
  });

  const duplicates = Object.entries(slugMap).filter(([slug, drawings]) => drawings.length > 1);

  console.log(`Duplicate slugs (same language): ${duplicates.length}\n`);

  // Categorize duplicates
  const categories = {
    sameURL: [],           // Exact same category/subcategory - MUST fix
    differentSubcategory: [], // Same category, different subcategory
    differentCategory: [], // Completely different categories
    hasDraft: []          // Has draft versions
  };

  duplicates.forEach(([slug, drawings]) => {
    const urls = [...new Set(drawings.map(d => `${d.categorySlug}/${d.subcategorySlug}/${d.slug}`))];
    const hasDraftVersion = drawings.some(d => d.isDraft);

    const item = { slug, drawings, urls };

    if (hasDraftVersion) {
      categories.hasDraft.push(item);
    }

    if (urls.length === 1) {
      // Same exact URL - most critical
      categories.sameURL.push(item);
    } else {
      const categorySet = new Set(drawings.map(d => d.categorySlug));
      if (categorySet.size === 1) {
        // Same category, different subcategory
        categories.differentSubcategory.push(item);
      } else {
        // Different categories entirely
        categories.differentCategory.push(item);
      }
    }
  });

  console.log('=== CATEGORIZATION RESULTS ===\n');
  console.log(`🔴 CRITICAL - Same exact URL: ${categories.sameURL.length}`);
  console.log(`🟡 MEDIUM - Same category, different subcategory: ${categories.differentSubcategory.length}`);
  console.log(`🟢 LOW - Different categories: ${categories.differentCategory.length}`);
  console.log(`📝 Has draft versions: ${categories.hasDraft.length}\n`);

  // Detailed report for CRITICAL issues (same URL)
  console.log('\n=== 🔴 CRITICAL: SAME EXACT URL (Must Fix Immediately) ===\n');
  console.log('These have identical URLs and will confuse Google:\n');

  categories.sameURL.forEach((item, index) => {
    console.log(`${index + 1}. Slug: "${item.slug}"`);
    console.log(`   URL: ${item.urls[0]}`);
    console.log(`   Number of versions: ${item.drawings.length}\n`);

    item.drawings.forEach((d, i) => {
      console.log(`   Version ${i + 1}:`);
      console.log(`      ID: ${d._id}`);
      console.log(`      Title: ${d.title}`);
      console.log(`      Created: ${d._createdAt}`);
      console.log(`      Updated: ${d._updatedAt}`);
      console.log(`      Downloads: ${d.downloadCount || 0}`);
      console.log(`      Draft: ${d.isDraft ? 'YES' : 'NO'}`);
    });
    console.log('');
  });

  // Detailed report for drafts
  console.log('\n=== 📝 DRAFTS (Should be easy to fix) ===\n');
  console.log('These have draft versions that should probably be removed:\n');

  categories.hasDraft.forEach((item, index) => {
    console.log(`${index + 1}. Slug: "${item.slug}"`);
    item.drawings.forEach((d, i) => {
      if (d.isDraft) {
        console.log(`   🔸 DRAFT: ${d._id}`);
      } else {
        console.log(`   ✓ Published: ${d._id}`);
      }
    });
    console.log('');
  });

  // Analyze different category duplicates
  console.log('\n=== 🟢 DIFFERENT CATEGORIES (May be intentional) ===\n');
  console.log('Same slug in different categories - decide which to keep or rename:\n');

  categories.differentCategory.slice(0, 10).forEach((item, index) => {
    console.log(`${index + 1}. Slug: "${item.slug}"`);
    item.drawings.forEach((d, i) => {
      console.log(`   Version ${i + 1}: ${d.categoryTitle} > ${d.subcategoryTitle}`);
      console.log(`      URL: /${d.categorySlug}/${d.subcategorySlug}/${d.slug}`);
      console.log(`      Downloads: ${d.downloadCount || 0}`);
    });
    console.log('');
  });

  if (categories.differentCategory.length > 10) {
    console.log(`... and ${categories.differentCategory.length - 10} more\n`);
  }

  // Generate recommendations
  console.log('\n=== 💡 RECOMMENDED ACTIONS ===\n');

  console.log('1. IMMEDIATE - Fix "Same URL" duplicates:');
  console.log(`   - ${categories.sameURL.length} duplicates to fix`);
  console.log('   - Strategy: Keep the newest version, deactivate others');
  console.log('   - OR: Add number suffix to slug (e.g., -2, -3)');
  console.log('   - Redirects: NOT needed (same URL already)\n');

  console.log('2. EASY - Remove draft versions:');
  console.log(`   - ${categories.hasDraft.length} duplicates with drafts`);
  console.log('   - Strategy: Delete draft versions');
  console.log('   - Redirects: NOT needed (drafts not indexed)\n');

  console.log('3. REVIEW - Different category duplicates:');
  console.log(`   - ${categories.differentCategory.length} duplicates`);
  console.log('   - Strategy: Decide case-by-case');
  console.log('   - Rename with context (e.g., "dinosaur-bal" vs "party-bal")');
  console.log('   - Redirects: YES needed (different URLs)\n');

  // Save detailed report to JSON
  const report = {
    summary: {
      totalNorwegian: norwegianDrawings.length,
      totalDuplicates: duplicates.length,
      critical: categories.sameURL.length,
      medium: categories.differentSubcategory.length,
      low: categories.differentCategory.length,
      drafts: categories.hasDraft.length
    },
    sameURL: categories.sameURL.map(item => ({
      slug: item.slug,
      url: item.urls[0],
      count: item.drawings.length,
      versions: item.drawings.map(d => ({
        id: d._id,
        title: d.title,
        created: d._createdAt,
        downloads: d.downloadCount || 0,
        isDraft: d.isDraft
      }))
    })),
    hasDraft: categories.hasDraft.map(item => ({
      slug: item.slug,
      versions: item.drawings.map(d => ({
        id: d._id,
        isDraft: d.isDraft
      }))
    })),
    differentCategory: categories.differentCategory.map(item => ({
      slug: item.slug,
      versions: item.drawings.map(d => ({
        id: d._id,
        url: `/${d.categorySlug}/${d.subcategorySlug}/${d.slug}`,
        category: d.categoryTitle,
        subcategory: d.subcategoryTitle,
        downloads: d.downloadCount || 0
      }))
    }))
  };

  const fs = require('fs');
  fs.writeFileSync(
    'duplicate-analysis-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n✅ Detailed report saved to: duplicate-analysis-report.json\n');

  console.log('=== NEXT STEPS ===\n');
  console.log('1. Review the report above');
  console.log('2. Decide which duplicates to keep vs rename vs deactivate');
  console.log('3. Run fix scripts for each category\n');
}

analyzeSameLanguageDuplicates().catch(console.error);
