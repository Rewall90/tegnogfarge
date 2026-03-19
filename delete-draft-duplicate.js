const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

(async () => {
  console.log('🗑️  Deleting Draft Duplicate\n');
  console.log('='.repeat(70));

  const draftId = 'drafts.MJAOY9y6GD6Vij4lxJzqwF';

  console.log(`\nDraft to delete: ${draftId}\n`);

  // First verify the draft exists and get its details
  const draft = await client.fetch(
    `*[_id == $draftId][0]{ _id, title, "slug": slug.current, language, baseDocumentId }`,
    { draftId }
  );

  if (!draft) {
    console.log('❌ Draft document not found - it may have already been deleted\n');
    return;
  }

  console.log('Draft document details:');
  console.log(`  Title: ${draft.title}`);
  console.log(`  Slug: ${draft.slug}`);
  console.log(`  Language: ${draft.language}`);
  console.log(`  Base Document ID: ${draft.baseDocumentId}\n`);

  // Verify the published version exists
  const publishedId = draftId.replace('drafts.', '');
  const published = await client.fetch(
    `*[_id == $publishedId][0]{ _id, title }`,
    { publishedId }
  );

  if (published) {
    console.log('✓ Published version exists:');
    console.log(`  ID: ${published._id}`);
    console.log(`  Title: ${published.title}\n`);
  } else {
    console.log('⚠️  WARNING: Published version not found!\n');
    console.log('This draft may be the only version. Aborting deletion.\n');
    return;
  }

  console.log('='.repeat(70));
  console.log('\n🗑️  Deleting draft...\n');

  try {
    await client.delete(draftId);
    console.log(`✅ Successfully deleted draft: ${draftId}\n`);
  } catch (error) {
    console.error('❌ Failed to delete draft:', error.message);
    console.error('\nFull error:', error);
    return;
  }

  console.log('='.repeat(70));
  console.log('\n✓ Verification:\n');

  // Verify the draft is gone
  const draftCheck = await client.fetch(
    `count(*[_id == $draftId])`,
    { draftId }
  );

  console.log(`  Draft exists: ${draftCheck > 0 ? '❌ YES (deletion failed)' : '✅ NO (successfully deleted)'}`);

  // Verify the published version still exists
  const publishedCheck = await client.fetch(
    `count(*[_id == $publishedId])`,
    { publishedId }
  );

  console.log(`  Published exists: ${publishedCheck > 0 ? '✅ YES' : '❌ NO (ERROR!)'}\n`);

  // Count German drawings in Vennskap subcategory again
  const deSub = await client.fetch(
    `*[_type == "subcategory" && language == "de" && title match "*Freundschaft*"][0]{ _id }`
  );

  const deDrawingCount = await client.fetch(
    `count(*[_type == "drawingImage" && language == "de" && subcategory._ref == $deSubId])`,
    { deSubId: deSub._id }
  );

  console.log(`  German drawings in Vennskap subcategory: ${deDrawingCount}\n`);
  console.log(`  Expected: 34, Actual: ${deDrawingCount}, Match: ${deDrawingCount === 34 ? '✅ YES' : '❌ NO'}\n`);

  console.log('='.repeat(70));
  console.log('\n✅ Draft cleanup complete!\n');
})();
