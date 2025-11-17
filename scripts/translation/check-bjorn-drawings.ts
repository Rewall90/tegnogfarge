import { getSanityClient } from './sanity-client';

async function checkBjornDrawings() {
  const client = getSanityClient();
  console.log('\n🔍 Checking Swedish drawings for "mala-bjorn" subcategory...\n');

  // First, find the subcategory
  const subcategory = await client.fetch(`
    *[_type == "subcategory" && slug.current == "mala-bjorn"][0] {
      _id,
      "title_no": title.no,
      "title_sv": title.sv,
      "slug": slug.current,
      "category": category->{
        "title_no": title.no,
        "title_sv": title.sv,
        "slug": slug.current
      }
    }
  `);

  if (!subcategory) {
    console.log('❌ Subcategory "mala-bjorn" not found in Sanity');
    return;
  }

  console.log('✅ Found subcategory:');
  console.log(`   Norwegian: ${subcategory.title_no}`);
  console.log(`   Swedish: ${subcategory.title_sv || '❌ NOT TRANSLATED'}`);
  console.log(`   Category: ${subcategory.category?.title_no} (${subcategory.category?.slug})`);
  console.log(`   Subcategory ID: ${subcategory._id}\n`);

  // Now check for drawings
  const drawings = await client.fetch(`
    *[_type == "drawing" && subcategory._ref == $subcategoryId] | order(_createdAt desc) {
      _id,
      "title_no": title.no,
      "title_sv": title.sv,
      "slug_no": slug.no.current,
      "slug_sv": slug.sv.current,
      "status_no": publishStatus.no,
      "status_sv": publishStatus.sv,
      "hasSwedishTranslation": defined(title.sv) && defined(slug.sv.current),
      "isPublishedSv": publishStatus.sv == "published"
    }
  `, { subcategoryId: subcategory._id });

  console.log(`📊 Found ${drawings.length} drawings in this subcategory\n`);

  if (drawings.length === 0) {
    console.log('❌ NO DRAWINGS found for this subcategory!');
    return;
  }

  // Count Swedish translations
  const withSwedish = drawings.filter((d: any) => d.hasSwedishTranslation);
  const publishedSwedish = drawings.filter((d: any) => d.isPublishedSv);

  console.log(`✅ Drawings with Swedish translation: ${withSwedish.length}/${drawings.length}`);
  console.log(`✅ Published in Swedish: ${publishedSwedish.length}/${drawings.length}\n`);

  // Show first 5 drawings
  console.log('First 5 drawings:');
  drawings.slice(0, 5).forEach((drawing: any, index: number) => {
    console.log(`\n${index + 1}. ${drawing.title_no}`);
    console.log(`   Swedish title: ${drawing.title_sv || '❌ NOT TRANSLATED'}`);
    console.log(`   Norwegian slug: ${drawing.slug_no}`);
    console.log(`   Swedish slug: ${drawing.slug_sv || '❌ NOT TRANSLATED'}`);
    console.log(`   Status NO: ${drawing.status_no}`);
    console.log(`   Status SV: ${drawing.status_sv || '❌ NOT SET'}`);
  });

  // Summary
  console.log('\n\n📋 SUMMARY:');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Total drawings: ${drawings.length}`);
  console.log(`With Swedish translation: ${withSwedish.length} (${((withSwedish.length / drawings.length) * 100).toFixed(1)}%)`);
  console.log(`Published in Swedish: ${publishedSwedish.length} (${((publishedSwedish.length / drawings.length) * 100).toFixed(1)}%)`);

  if (publishedSwedish.length === 0) {
    console.log('\n❌ ISSUE FOUND: No drawings are published in Swedish!');
    console.log('   This is why the page shows no coloring images.');
    console.log('\n💡 SOLUTION: Run the translation script to translate and publish these drawings.');
  } else if (publishedSwedish.length < drawings.length) {
    console.log(`\n⚠️  WARNING: Only ${publishedSwedish.length} out of ${drawings.length} drawings are published in Swedish.`);
  } else {
    console.log('\n✅ All drawings are published in Swedish - issue might be elsewhere.');
  }
}

checkBjornDrawings().catch(console.error);
