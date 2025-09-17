import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-06-05',
  useCdn: false
});

// List of copyrighted subcategory IDs found earlier
const copyrightedSubcategoryIds = [
  '0ee36888-dd85-4390-8e5b-1611d37810ec', // Pokemon Figurer
  '7946942b-c622-473e-b807-16b8674c8afb', // Fargelgg PawPatrol
  'd73b37fc-2d66-436e-9e21-ebd3ca3fdc51', // Fargelegg Ole Brumm
  'ab07aa95-db21-40df-8fae-980804cb5785', // Fargelegg Ninjago
  '790d299b-9ae8-4656-bbe0-d13582d3c690', // Fargelegg Minions
  '3ffdc5b9-e400-47e2-9d89-d284514aa736', // Fargelegg Karakterene i My Little Pony
  '21780f69-53f4-4aa2-a122-23bc41007982', // Fargelegg Hello Kitty
  '01781d83-f1de-43bd-9be6-5040e1fee4e5', // Fargelegg Harry Potter
  'feb10488-b0d3-4213-92a4-7d41fe8b27a0', // Fargelegg Elsa
  '6941859a-69cd-470a-ab2b-98b7ee213e6e', // Disney Prinsesser
  '8a19da8a-5aed-4552-91ba-141b3ee914bb', // Fargelegg Disney Figurer
  '6265e08e-b88e-43a9-8d33-10ba50645ed3', // Fargelegg Barbie
  '8629531d-3edf-4ede-9309-8695001471b9', // Fargelegg Spiderman
  'f4545a83-f722-4dca-a94e-5e60c85387be', // Fargelegg Sonic
  '2cb2b5c8-92b1-4182-8b09-5600adc2fe04', // Fargelegg Mario
  '1270073f-1bcb-4000-9255-4b12568e9d10', // Fargelegg DeadPool
  'dd1aeea8-b581-4b72-83a2-15b7ff0beacb'  // Fargelegg Captain America
];

async function deactivateCopyrightedContent() {
  console.log('🚨 Starting copyright compliance process...');
  console.log(`📋 Deactivating ${copyrightedSubcategoryIds.length} copyrighted subcategories`);

  try {
    // Step 1: Deactivate all subcategories
    console.log('\n📁 Deactivating subcategories...');
    const subcategoryPromises = copyrightedSubcategoryIds.map(async (id) => {
      try {
        const result = await client
          .patch(id)
          .set({ isActive: false })
          .commit();

        console.log(`✅ Deactivated subcategory: ${id}`);
        return { id, status: 'success', type: 'subcategory' };
      } catch (error) {
        console.error(`❌ Failed to deactivate subcategory ${id}:`, error.message);
        return { id, status: 'error', error: error.message, type: 'subcategory' };
      }
    });

    const subcategoryResults = await Promise.all(subcategoryPromises);

    // Step 2: Find and deactivate all related drawings
    console.log('\n🎨 Finding and deactivating related drawings...');

    let allDrawings = [];
    for (const subcategoryId of copyrightedSubcategoryIds) {
      try {
        const drawings = await client.fetch(`
          *[_type == "drawingImage" && subcategory._ref == $subcategoryId] {
            _id,
            title,
            isActive
          }
        `, { subcategoryId });

        allDrawings = allDrawings.concat(drawings.map(d => ({ ...d, subcategoryId })));
      } catch (error) {
        console.error(`❌ Failed to fetch drawings for subcategory ${subcategoryId}:`, error.message);
      }
    }

    console.log(`📊 Found ${allDrawings.length} drawings to deactivate`);

    // Deactivate drawings in batches
    const batchSize = 10;
    const drawingResults = [];

    for (let i = 0; i < allDrawings.length; i += batchSize) {
      const batch = allDrawings.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allDrawings.length/batchSize)} (${batch.length} drawings)`);

      const batchPromises = batch.map(async (drawing) => {
        try {
          await client
            .patch(drawing._id)
            .set({ isActive: false })
            .commit();

          console.log(`✅ Deactivated drawing: ${drawing.title} (${drawing._id})`);
          return { id: drawing._id, status: 'success', type: 'drawing', title: drawing.title };
        } catch (error) {
          console.error(`❌ Failed to deactivate drawing ${drawing._id}:`, error.message);
          return { id: drawing._id, status: 'error', error: error.message, type: 'drawing', title: drawing.title };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      drawingResults.push(...batchResults);

      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < allDrawings.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Summary
    console.log('\n📊 DEACTIVATION COMPLETE');
    console.log('='.repeat(50));

    const successfulSubcategories = subcategoryResults.filter(r => r.status === 'success');
    const failedSubcategories = subcategoryResults.filter(r => r.status === 'error');
    const successfulDrawings = drawingResults.filter(r => r.status === 'success');
    const failedDrawings = drawingResults.filter(r => r.status === 'error');

    console.log(`✅ Subcategories deactivated: ${successfulSubcategories.length}/${copyrightedSubcategoryIds.length}`);
    console.log(`✅ Drawings deactivated: ${successfulDrawings.length}/${allDrawings.length}`);

    if (failedSubcategories.length > 0) {
      console.log(`❌ Failed subcategories: ${failedSubcategories.length}`);
      failedSubcategories.forEach(f => console.log(`   - ${f.id}: ${f.error}`));
    }

    if (failedDrawings.length > 0) {
      console.log(`❌ Failed drawings: ${failedDrawings.length}`);
      failedDrawings.forEach(f => console.log(`   - ${f.title} (${f.id}): ${f.error}`));
    }

    console.log('\n🎯 COPYRIGHT COMPLIANCE ACTIONS COMPLETED');
    console.log('Next steps:');
    console.log('1. ✅ Redirects configured (410 Gone)');
    console.log('2. ✅ Footer navigation updated');
    console.log('3. ✅ Content deactivated in CMS');
    console.log('4. 🔄 Deploy changes to production');
    console.log('5. 🔄 Update sitemap (will happen automatically)');

    return {
      subcategories: { successful: successfulSubcategories.length, failed: failedSubcategories.length },
      drawings: { successful: successfulDrawings.length, failed: failedDrawings.length },
      errors: [...failedSubcategories, ...failedDrawings]
    };

  } catch (error) {
    console.error('💥 Critical error during deactivation process:', error);
    throw error;
  }
}

// Run the deactivation process
if (process.env.SANITY_API_TOKEN) {
  deactivateCopyrightedContent()
    .then((results) => {
      console.log('\n🏁 Process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error);
      process.exit(1);
    });
} else {
  console.error('❌ SANITY_API_TOKEN environment variable is required');
  console.log('Please set your Sanity API token with write permissions');
  process.exit(1);
}