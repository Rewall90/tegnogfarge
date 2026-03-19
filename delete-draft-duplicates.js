require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN,
});

// List of draft IDs to delete from the analysis
const draftIdsToDelete = [
  'drafts.drawingImage-bamse-husker-med-bokstaven-u-1750912951',
  'drafts.drawingImage-flagget-til-aland-1763395444',
  'drafts.drawingImage-flagget-til-algerie-1763390361',
  'drafts.drawingImage-glad-skjell-med-krone-1751886309',
  'drafts.drawingImage-grisen-kjorer-traktor-pa-garden-1751791941',
  'drafts.drawingImage-gul-taxi-klar-for-tur-1750853696',
  'drafts.drawingImage-gulrotter-med-sloyfe-sammen-1758270821',
  'drafts.drawingImage-kul-bil-fra-nascar-lop-1759378488',
  'drafts.drawingImage-monstertruck-hopper-over-bakken-1750410174',
  'drafts.drawingImage-mustanghest-loper-fort-ute-1758031706',
  'drafts.drawingImage-nissen-kommer-med-gave-1761199776',
  'drafts.drawingImage-robot-gir-vann-til-blomster-1754397213',
  'drafts.drawingImage-robot-kjorer-pa-rullebrett-1754397235',
  'drafts.drawingImage-snill-prinsesse-med-tryllestav-1750486490',
  'drafts.drawingImage-sommerfugl-med-stort-smil-1750694498',
  'drafts.drawingImage-stor-lastebil-med-tommerstokker-1758357678',
  'drafts.drawingImage-stor-scania-lastebil-pa-veien-1758357905',
  'drafts.drawingImage-tegn-og-lr-om-planeten-merkur-1750149005',
  'drafts.drawingImage-traktor-kjrer-i-byen-1750410193',
  'drafts.drawingImage-trikk-kjorer-under-regnbuen-1760509227',
  'drafts.drawingImage-ulv-gar-langs-togskinnene-1761717133'
];

async function deleteDraftDuplicates() {
  console.log('=== DELETING DRAFT DUPLICATES ===\n');
  console.log(`Total drafts to delete: ${draftIdsToDelete.length}\n`);

  let deletedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const draftId of draftIdsToDelete) {
    try {
      // First, verify the draft exists
      const draft = await client.fetch(`*[_id == $draftId][0] { _id, title }`, { draftId });

      if (!draft) {
        console.log(`❌ NOT FOUND: ${draftId}`);
        notFoundCount++;
        continue;
      }

      console.log(`🗑️  Deleting: ${draftId}`);
      console.log(`   Title: ${draft.title}`);

      // Delete the draft
      await client.delete(draftId);

      console.log(`   ✅ DELETED\n`);
      deletedCount++;

    } catch (error) {
      console.log(`❌ ERROR deleting ${draftId}:`);
      console.log(`   ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n=== DELETION SUMMARY ===\n');
  console.log(`✅ Successfully deleted: ${deletedCount}`);
  console.log(`❌ Not found: ${notFoundCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);
  console.log(`\nTotal processed: ${draftIdsToDelete.length}\n`);

  // Verify cleanup
  console.log('=== VERIFICATION ===\n');
  console.log('Checking if any drafts still exist...\n');

  const remainingDrafts = await client.fetch(`
    *[_id in $draftIds] { _id, title }
  `, { draftIds: draftIdsToDelete });

  if (remainingDrafts.length === 0) {
    console.log('✅ All drafts successfully deleted!\n');
  } else {
    console.log(`⚠️  ${remainingDrafts.length} drafts still exist:`);
    remainingDrafts.forEach(draft => {
      console.log(`   - ${draft._id}: ${draft.title}`);
    });
    console.log('');
  }

  console.log('=== NEXT STEPS ===\n');
  console.log('1. ✅ Draft duplicates are now removed');
  console.log('2. Next: Run the script to deactivate older published versions');
  console.log('3. Then: Check sitemap to verify duplicates are gone\n');
}

deleteDraftDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
