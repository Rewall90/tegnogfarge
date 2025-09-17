import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: 'skUEtk3e3NAlADz1wcrtCp1ZC9LTwHemwLVInXv4v4EWDA62tG8VRHBXJnDYW9OLJyxtk03E4QaM1cp3kVBKPQFOjQm9MwIWoDyUKj7N5U3NNvMD6CzHLGSUOnK2M9aU4sQt5ba7BZA7WXd8RPTNtmEomJuAw0ohLmuCBwY7NCz1SnEFrtbB'
});

// List of copyrighted subcategory IDs
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

async function listCopyrightedContent() {
  console.log('📋 LISTING COPYRIGHTED CONTENT FOR MANUAL DEACTIVATION');
  console.log('='.repeat(60));

  try {
    // Get subcategory details
    console.log('\n📁 SUBCATEGORIES TO DEACTIVATE:');
    console.log('-'.repeat(40));

    for (const id of copyrightedSubcategoryIds) {
      try {
        const subcategory = await client.fetch(`
          *[_type == "subcategory" && _id == $id][0] {
            _id,
            title,
            "slug": slug.current,
            isActive,
            "parentCategory": parentCategory->{ title, "slug": slug.current },
            "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id])
          }
        `, { id });

        if (subcategory) {
          const status = subcategory.isActive ? '🔴 ACTIVE' : '✅ INACTIVE';
          console.log(`${status} | ${subcategory.title}`);
          console.log(`   ID: ${subcategory._id}`);
          console.log(`   URL: /${subcategory.parentCategory?.slug}/${subcategory.slug}`);
          console.log(`   Drawings: ${subcategory.drawingCount}`);
          console.log('');
        } else {
          console.log(`❌ Subcategory not found: ${id}`);
        }
      } catch (error) {
        console.error(`❌ Error fetching subcategory ${id}:`, error.message);
      }
    }

    // Count active subcategories and drawings
    const activeSubcategories = await client.fetch(`
      count(*[_type == "subcategory" && _id in $ids && isActive == true])
    `, { ids: copyrightedSubcategoryIds });

    const totalDrawings = await client.fetch(`
      count(*[_type == "drawingImage" && subcategory._ref in $ids])
    `, { ids: copyrightedSubcategoryIds });

    const activeDrawings = await client.fetch(`
      count(*[_type == "drawingImage" && subcategory._ref in $ids && isActive == true])
    `, { ids: copyrightedSubcategoryIds });

    console.log('\n📊 SUMMARY:');
    console.log('-'.repeat(30));
    console.log(`Total subcategories: ${copyrightedSubcategoryIds.length}`);
    console.log(`Active subcategories: ${activeSubcategories}`);
    console.log(`Total drawings: ${totalDrawings}`);
    console.log(`Active drawings: ${activeDrawings}`);

    if (activeSubcategories > 0 || activeDrawings > 0) {
      console.log('\n⚠️  MANUAL ACTION REQUIRED:');
      console.log('Please go to your Sanity Studio and:');
      console.log('1. Navigate to each active subcategory above');
      console.log('2. Set "Aktiv" (isActive) to false');
      console.log('3. Save changes');
      console.log('\nAlternatively, use the Sanity Studio vision tool to run:');
      console.log('');
      copyrightedSubcategoryIds.forEach(id => {
        console.log(`// Deactivate ${id}`);
        console.log(`*[_type == "subcategory" && _id == "${id}"][0]`);
      });
      console.log('\nThen manually set isActive to false for each one.');
    } else {
      console.log('\n✅ All copyrighted content is already deactivated!');
    }

  } catch (error) {
    console.error('💥 Error listing content:', error);
  }
}

listCopyrightedContent();