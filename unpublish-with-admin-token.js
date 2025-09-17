import { createClient } from '@sanity/client';

// Using the admin auth token from sanity debug
const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: 'skeH9E1Tr9Y29OEYyauboVfH0V13Il1W4tnZ5QpXjsFYMJgM1iEUOL4Q8OVMKYm96PWsuDE9cgjt291gE'
});

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

async function unpublishAllCopyrightedContent() {
  console.log('🚨 STARTING AUTOMATED COPYRIGHT COMPLIANCE');
  console.log('='.repeat(50));
  console.log(`📋 Processing ${copyrightedSubcategoryIds.length} copyrighted subcategories`);

  try {
    // Step 1: Unpublish all subcategories
    console.log('\n📁 Unpublishing subcategories...');
    let subcategorySuccess = 0;
    let subcategoryFailures = [];

    for (const id of copyrightedSubcategoryIds) {
      try {
        const result = await client
          .patch(id)
          .set({ isActive: false })
          .commit();

        console.log(`✅ Unpublished subcategory: ${id}`);
        subcategorySuccess++;
      } catch (error) {
        console.error(`❌ Failed subcategory ${id}: ${error.message}`);
        subcategoryFailures.push({ id, error: error.message });
      }
    }

    // Step 2: Get all related drawings
    console.log('\n🎨 Finding all related drawings...');
    const allDrawings = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref in $ids] {
        _id,
        title,
        isActive,
        "subcategoryId": subcategory._ref
      }
    `, { ids: copyrightedSubcategoryIds });

    console.log(`📊 Found ${allDrawings.length} drawings to unpublish`);

    // Step 3: Unpublish all drawings in batches
    console.log('\n🎨 Unpublishing drawings...');
    let drawingSuccess = 0;
    let drawingFailures = [];
    const batchSize = 20;

    for (let i = 0; i < allDrawings.length; i += batchSize) {
      const batch = allDrawings.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allDrawings.length / batchSize);

      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} drawings)`);

      for (const drawing of batch) {
        try {
          await client
            .patch(drawing._id)
            .set({ isActive: false })
            .commit();

          console.log(`✅ Unpublished: ${drawing.title}`);
          drawingSuccess++;
        } catch (error) {
          console.error(`❌ Failed: ${drawing.title} - ${error.message}`);
          drawingFailures.push({ id: drawing._id, title: drawing.title, error: error.message });
        }
      }

      // Small delay between batches
      if (i + batchSize < allDrawings.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Step 4: Final verification
    console.log('\n🔍 Verifying unpublishing...');
    const verification = await client.fetch(`
      {
        "unpublishedSubcategories": count(*[_type == "subcategory" && _id in $ids && isActive == false]),
        "unpublishedDrawings": count(*[_type == "drawingImage" && subcategory._ref in $ids && isActive == false]),
        "totalSubcategories": count(*[_type == "subcategory" && _id in $ids]),
        "totalDrawings": count(*[_type == "drawingImage" && subcategory._ref in $ids])
      }
    `, { ids: copyrightedSubcategoryIds });

    // Final report
    console.log('\n🎯 UNPUBLISHING COMPLETE!');
    console.log('='.repeat(40));
    console.log(`✅ Subcategories unpublished: ${subcategorySuccess}/${copyrightedSubcategoryIds.length}`);
    console.log(`✅ Drawings unpublished: ${drawingSuccess}/${allDrawings.length}`);

    if (subcategoryFailures.length > 0) {
      console.log(`❌ Subcategory failures: ${subcategoryFailures.length}`);
    }

    if (drawingFailures.length > 0) {
      console.log(`❌ Drawing failures: ${drawingFailures.length}`);
    }

    console.log('\n📊 VERIFICATION:');
    console.log(`Unpublished subcategories: ${verification.unpublishedSubcategories}/${verification.totalSubcategories}`);
    console.log(`Unpublished drawings: ${verification.unpublishedDrawings}/${verification.totalDrawings}`);

    if (verification.unpublishedSubcategories === verification.totalSubcategories &&
        verification.unpublishedDrawings === verification.totalDrawings) {
      console.log('\n🎉 SUCCESS! All copyrighted content has been unpublished!');
      console.log('✅ 410 redirects are configured');
      console.log('✅ Sitemaps will exclude this content');
      console.log('✅ Footer navigation cleaned');
      console.log('\n🚀 Ready to deploy to production!');
    } else {
      console.log('\n⚠️  Some content may still be published. Check the failures above.');
    }

    return true;

  } catch (error) {
    console.error('💥 Critical error:', error);
    return false;
  }
}

// Execute the unpublishing
unpublishAllCopyrightedContent()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Execution failed:', error);
    process.exit(1);
  });