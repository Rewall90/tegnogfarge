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

async function fixSameUrlDuplicates() {
  console.log('=== FIXING SAME-URL DUPLICATES ===\n');

  // Read the analysis report
  const report = JSON.parse(fs.readFileSync('duplicate-analysis-report.json', 'utf8'));

  console.log(`Total same-URL duplicates: ${report.sameURL.length}\n`);

  let keptCount = 0;
  let renamedCount = 0;
  let errorCount = 0;
  const redirectsNeeded = [];

  for (const item of report.sameURL) {
    console.log(`\n📋 Processing slug: "${item.slug}"`);
    console.log(`   URL: ${item.url}`);
    console.log(`   Versions: ${item.count}\n`);

    // Sort versions by creation date (newest first)
    const sortedVersions = [...item.versions].sort((a, b) =>
      new Date(b.created) - new Date(a.created)
    );

    // Keep the newest, rename the rest
    for (let i = 0; i < sortedVersions.length; i++) {
      const version = sortedVersions[i];

      if (i === 0) {
        // This is the newest - keep it
        console.log(`   ✅ KEEPING (newest): ${version.id}`);
        console.log(`      Title: ${version.title}`);
        console.log(`      Created: ${version.created}`);
        console.log(`      Downloads: ${version.downloads}`);
        console.log(`      Slug stays: ${item.slug}`);
        keptCount++;
      } else {
        // This is older - rename slug
        const newSlug = `${item.slug}-${i + 1}`;
        console.log(`   🔄 RENAMING (older): ${version.id}`);
        console.log(`      Title: ${version.title}`);
        console.log(`      Created: ${version.created}`);
        console.log(`      Downloads: ${version.downloads}`);
        console.log(`      Old slug: ${item.slug}`);
        console.log(`      New slug: ${newSlug}`);

        try {
          await client
            .patch(version.id)
            .set({
              slug: {
                _type: 'slug',
                current: newSlug
              }
            })
            .commit();

          console.log(`      ✅ Renamed successfully`);
          renamedCount++;

          // Add to redirects list (from new URL back to canonical)
          const oldUrl = item.url.replace(item.slug, newSlug);
          redirectsNeeded.push({
            from: `/${oldUrl}`,
            to: `/${item.url}`,
            reason: `Redirect duplicate #${i + 1} to canonical version`
          });

        } catch (error) {
          console.log(`      ❌ ERROR: ${error.message}`);
          errorCount++;
        }
      }
    }
  }

  console.log('\n\n=== FIXING SUMMARY ===\n');
  console.log(`✅ Versions kept (canonical): ${keptCount}`);
  console.log(`🔄 Versions renamed: ${renamedCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);
  console.log(`\nTotal slugs processed: ${report.sameURL.length}\n`);

  // Save redirects to file
  fs.writeFileSync(
    'redirects-for-duplicates.json',
    JSON.stringify(redirectsNeeded, null, 2)
  );

  console.log(`💾 Saved ${redirectsNeeded.length} redirects to: redirects-for-duplicates.json\n`);

  console.log('\n=== NEXT STEPS ===\n');
  console.log('1. ✅ Duplicates have been renamed with -2, -3 suffixes');
  console.log('2. Next: Implement redirects from redirects-for-duplicates.json in middleware');
  console.log('3. Then: Verify sitemap no longer has duplicate URLs');
  console.log('4. Finally: Resubmit sitemap to Google Search Console\n');
}

fixSameUrlDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
