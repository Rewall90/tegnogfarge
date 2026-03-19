require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN,
});

// These are the remaining duplicates to fix
const duplicatesToFix = [
  {
    keep: 'drawingImage-brannbil-med-lang-stige-1762062637',
    rename: [
      { id: 'drawingImage-brannbil-med-lang-stige-1762062613', slug: 'brannbil-med-lang-stige', newSlug: 'brannbil-med-lang-stige-2' },
      { id: 'drawingImage-brannbil-med-lang-stige-1762062498', slug: 'brannbil-med-lang-stige', newSlug: 'brannbil-med-lang-stige-3' }
    ]
  },
  {
    keep: 'drawingImage-isbjorn-star-pa-isen-1763368193',
    rename: [
      { id: 'drawingImage-isbjorn-star-pa-isen-1763368017', slug: 'isbjorn-star-pa-isen', newSlug: 'isbjorn-star-pa-isen-2' }
    ]
  },
  {
    keep: 'drawingImage-juletre-med-stjerne-og-kuler-1759554203',
    rename: [
      { id: 'drawingImage-juletre-med-stjerne-og-kuler-1759554131', slug: 'juletre-med-stjerne-og-kuler', newSlug: 'juletre-med-stjerne-og-kuler-2' }
    ]
  },
  {
    keep: 'drawingImage-juletre-med-stjerne-og-kuler-1761199955',
    rename: [
      { id: 'drawingImage-juletre-med-stjerne-og-kuler-1761199936', slug: 'juletre-med-stjerne-og-kuler', newSlug: 'juletre-med-stjerne-og-kuler-2' }
    ]
  },
  {
    keep: 'drawingImage-juletre-med-stjerne-og-pakker-1759725465',
    rename: [
      { id: 'drawingImage-juletre-med-stjerne-og-pakker-1759725408', slug: 'juletre-med-stjerne-og-pakker', newSlug: 'juletre-med-stjerne-og-pakker-2' }
    ]
  },
  {
    keep: 'drawingImage-nissen-kjorer-slede-med-gaver-1759554587',
    rename: [
      { id: 'drawingImage-nissen-kjorer-slede-med-gaver-1759554010', slug: 'nissen-kjorer-slede-med-gaver', newSlug: 'nissen-kjorer-slede-med-gaver-2' }
    ]
  },
  {
    keep: 'drawingImage-nissen-kommer-med-stor-sekk-1759637605',
    rename: [
      { id: 'drawingImage-nissen-kommer-med-stor-sekk-1759637581', slug: 'nissen-kommer-med-stor-sekk', newSlug: 'nissen-kommer-med-stor-sekk-2' }
    ]
  },
  {
    keep: 'drawingImage-sola-smiler-med-solbriller-1758447499',
    rename: [
      { id: 'drawingImage-sola-smiler-med-solbriller-1758447392', slug: 'sola-smiler-med-solbriller', newSlug: 'sola-smiler-med-solbriller-2' }
    ]
  }
];

async function fixRemaining8Duplicates() {
  console.log('=== FIXING REMAINING 8 DUPLICATE URLS ===\n');

  let keptCount = 0;
  let renamedCount = 0;
  let errorCount = 0;

  for (const duplicate of duplicatesToFix) {
    console.log(`\n✅ Keeping: ${duplicate.keep}\n`);
    keptCount++;

    for (const item of duplicate.rename) {
      console.log(`   🔄 Renaming: ${item.id}`);
      console.log(`      Old slug: ${item.slug}`);
      console.log(`      New slug: ${item.newSlug}`);

      try {
        await client
          .patch(item.id)
          .set({
            slug: {
              _type: 'slug',
              current: item.newSlug
            }
          })
          .commit();

        console.log(`      ✅ Renamed successfully\n`);
        renamedCount++;
      } catch (error) {
        console.log(`      ❌ ERROR: ${error.message}\n`);
        errorCount++;
      }
    }
  }

  console.log('\n=== FIXING SUMMARY ===\n');
  console.log(`✅ Canonical versions kept: ${keptCount}`);
  console.log(`🔄 Duplicates renamed: ${renamedCount}`);
  console.log(`⚠️  Errors: ${errorCount}\n`);

  console.log('=== NEXT STEP ===\n');
  console.log('Run verify-sitemap-duplicates.js to confirm all duplicates are fixed.\n');
}

fixRemaining8Duplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
