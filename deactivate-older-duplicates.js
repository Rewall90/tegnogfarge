require('dotenv').config();
const { createClient } = require('@sanity/client');
const fs = require('fs');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN,
});

async function deactivateOlderDuplicates() {
  console.log('=== DEACTIVATING OLDER DUPLICATE VERSIONS ===\n');

  // Read the analysis report
  const report = JSON.parse(fs.readFileSync('duplicate-analysis-report.json', 'utf8'));

  // Filter out duplicates that had drafts (already handled)
  const duplicatesWithoutDrafts = report.sameURL.filter(item => {
    const hasDraft = report.hasDraft.some(d => d.slug === item.slug);
    return !hasDraft;
  });

  console.log(`Total same-URL duplicates: ${report.sameURL.length}`);
  console.log(`Duplicates with drafts (already handled): ${report.hasDraft.length}`);
  console.log(`Duplicates to process now: ${duplicatesWithoutDrafts.length}\n`);

  let deactivatedCount = 0;
  let keptCount = 0;
  let errorCount = 0;

  for (const item of duplicatesWithoutDrafts) {
    console.log(`\n📋 Processing slug: "${item.slug}"`);
    console.log(`   URL: ${item.url}`);
    console.log(`   Versions: ${item.count}\n`);

    // Sort versions by _createdAt (keep newest)
    const sortedVersions = [...item.versions].sort((a, b) =>
      new Date(b.created) - new Date(a.created)
    );

    // Keep the newest (first after sorting), deactivate the rest
    for (let i = 0; i < sortedVersions.length; i++) {
      const version = sortedVersions[i];

      if (i === 0) {
        // This is the newest - keep it
        console.log(`   ✅ KEEPING (newest): ${version.id}`);
        console.log(`      Title: ${version.title}`);
        console.log(`      Created: ${version.created}`);
        console.log(`      Downloads: ${version.downloads}`);
        keptCount++;
      } else {
        // This is older - deactivate it
        console.log(`   🔻 DEACTIVATING (older): ${version.id}`);
        console.log(`      Title: ${version.title}`);
        console.log(`      Created: ${version.created}`);
        console.log(`      Downloads: ${version.downloads}`);

        try {
          await client
            .patch(version.id)
            .set({ isActive: false })
            .commit();

          console.log(`      ✅ Deactivated successfully`);
          deactivatedCount++;
        } catch (error) {
          console.log(`      ❌ ERROR: ${error.message}`);
          errorCount++;
        }
      }
    }
  }

  console.log('\n\n=== DEACTIVATION SUMMARY ===\n');
  console.log(`✅ Versions kept (newest): ${keptCount}`);
  console.log(`🔻 Versions deactivated (older): ${deactivatedCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);
  console.log(`\nTotal slugs processed: ${duplicatesWithoutDrafts.length}\n`);

  // Verification
  console.log('=== VERIFICATION ===\n');
  console.log('Checking for remaining same-URL duplicates...\n');

  const remainingDuplicates = await client.fetch(`
    *[_type == "drawingImage" && isActive == true && language == "no"] {
      "slug": slug.current,
      "url": subcategory->parentCategory->slug.current + "/" + subcategory->slug.current + "/" + slug.current
    } | order(slug asc)
  `);

  // Group by URL
  const urlMap = {};
  remainingDuplicates.forEach(drawing => {
    if (!urlMap[drawing.url]) {
      urlMap[drawing.url] = [];
    }
    urlMap[drawing.url].push(drawing);
  });

  const stillDuplicated = Object.entries(urlMap).filter(([url, drawings]) => drawings.length > 1);

  if (stillDuplicated.length === 0) {
    console.log('✅ SUCCESS! No more same-URL duplicates found!\n');
  } else {
    console.log(`⚠️  WARNING: ${stillDuplicated.length} URLs still have duplicates:\n`);
    stillDuplicated.slice(0, 10).forEach(([url, drawings]) => {
      console.log(`   - ${url} (${drawings.length} versions)`);
    });
    if (stillDuplicated.length > 10) {
      console.log(`   ... and ${stillDuplicated.length - 10} more\n`);
    }
  }

  console.log('\n=== NEXT STEPS ===\n');
  console.log('1. ✅ Older duplicates are now deactivated');
  console.log('2. Next: Review the 2 different-category duplicates manually');
  console.log('3. Then: Regenerate sitemap and check for duplicates');
  console.log('4. Finally: Resubmit sitemap to Google Search Console\n');
}

deactivateOlderDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
