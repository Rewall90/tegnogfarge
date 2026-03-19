require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN,
});

async function reactivateDeactivatedPages() {
  console.log('=== REACTIVATING INCORRECTLY DEACTIVATED PAGES ===\n');

  // Get all Norwegian drawings that were recently deactivated
  const deactivatedDrawings = await client.fetch(`
    *[_type == "drawingImage" && isActive == false && language == "no"] {
      _id,
      _updatedAt,
      title,
      "slug": slug.current,
      "categorySlug": subcategory->parentCategory->slug.current,
      "categoryTitle": subcategory->parentCategory->title,
      "subcategorySlug": subcategory->slug.current,
      "subcategoryTitle": subcategory->title
    } | order(_updatedAt desc)
  `);

  console.log(`Found ${deactivatedDrawings.length} deactivated Norwegian drawings\n`);

  // Filter to only those updated in the last 5 minutes (the ones we just deactivated)
  const now = new Date();
  const recentlyDeactivated = deactivatedDrawings.filter(d => {
    const updatedAt = new Date(d._updatedAt);
    const diffMinutes = (now - updatedAt) / (1000 * 60);
    return diffMinutes < 5;
  });

  console.log(`Recently deactivated (last 5 min): ${recentlyDeactivated.length}\n`);

  if (recentlyDeactivated.length === 0) {
    console.log('No recently deactivated pages found. Nothing to reactivate.\n');
    return;
  }

  console.log('Pages to reactivate:\n');
  recentlyDeactivated.forEach((d, i) => {
    console.log(`${i + 1}. ${d.title}`);
    console.log(`   URL: /${d.categorySlug}/${d.subcategorySlug}/${d.slug}`);
    console.log(`   ID: ${d._id}\n`);
  });

  let reactivatedCount = 0;
  let errorCount = 0;

  for (const drawing of recentlyDeactivated) {
    try {
      await client
        .patch(drawing._id)
        .set({ isActive: true })
        .commit();

      console.log(`✅ Reactivated: ${drawing.title}`);
      reactivatedCount++;
    } catch (error) {
      console.log(`❌ ERROR reactivating ${drawing._id}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n\n=== REACTIVATION SUMMARY ===\n');
  console.log(`✅ Successfully reactivated: ${reactivatedCount}`);
  console.log(`❌ Errors: ${errorCount}\n`);

  console.log('=== APOLOGY ===\n');
  console.log('I sincerely apologize for this mistake. I should have verified that');
  console.log('the duplicates actually had the SAME URL before deactivating them.');
  console.log('The issue was that I confused "same slug" with "same URL".\n');
  console.log('The only real duplicates were the 21 draft versions, which have');
  console.log('already been correctly deleted.\n');
}

reactivateDeactivatedPages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
