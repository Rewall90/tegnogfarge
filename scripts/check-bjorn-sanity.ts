import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function checkBjornDrawings() {
  console.log('\n🔍 Checking Swedish drawings for "mala-bjorn" subcategory in Sanity...\n');

  // Check ALL subcategories with slug containing "bjorn"
  const allBjornSubcats = await client.fetch(`
    *[_type == "subcategory" && slug.current match "*bjorn*"] {
      _id,
      title,
      "slug": slug.current,
      language,
      isActive,
      "parentCategory": parentCategory->{ title, "slug": slug.current }
    }
  `);

  console.log('All subcategories matching "*bjorn*":');
  console.log(JSON.stringify(allBjornSubcats, null, 2));

  // Check Norwegian subcategory
  const subcategoryNo = await client.fetch(`
    *[_type == "subcategory" && slug.current == "mala-bjorn" && language == "no"][0] {
      _id,
      title,
      "slug": slug.current,
      language,
      isActive,
      "parentCategory": parentCategory->{ title, "slug": slug.current }
    }
  `);

  console.log('Norwegian subcategory:');
  console.log(JSON.stringify(subcategoryNo, null, 2));

  // Check Swedish subcategory
  const subcategorySv = await client.fetch(`
    *[_type == "subcategory" && slug.current == "mala-bjorn" && language == "sv"][0] {
      _id,
      title,
      "slug": slug.current,
      language,
      isActive,
      "parentCategory": parentCategory->{ title, "slug": slug.current }
    }
  `);

  console.log('\nSwedish subcategory:');
  console.log(JSON.stringify(subcategorySv, null, 2));

  // Find the Swedish bear (animal) subcategory
  const svBearAnimal = allBjornSubcats.find(s =>
    s.language === 'sv' && s.parentCategory?.slug === 'djur'
  );

  // Find the Norwegian bear subcategory
  const noBearAnimal = allBjornSubcats.find(s =>
    s.language === 'no' && s.parentCategory?.slug === 'dyr'
  );

  if (!svBearAnimal) {
    console.log('\n❌ Swedish bear (animal) subcategory not found!');
    return;
  }

  if (!noBearAnimal) {
    console.log('\n❌ Norwegian bear (animal) subcategory not found!');
    return;
  }

  console.log('\n✅ Found matching subcategories:');
  console.log(`   Norwegian: "${noBearAnimal.title}" (${noBearAnimal.slug})`);
  console.log(`   Swedish: "${svBearAnimal.title}" (${svBearAnimal.slug})`);

  // Count drawings for each language
  const drawingsNo = await client.fetch(`
    count(*[_type == "drawingImage" && subcategory._ref == $subcategoryId && isActive == true && language == "no"])
  `, { subcategoryId: noBearAnimal._id });

  const drawingsSv = await client.fetch(`
    count(*[_type == "drawingImage" && subcategory._ref == $subcategoryId && isActive == true && language == "sv"])
  `, { subcategoryId: svBearAnimal._id });

  console.log('\n📊 Drawing Counts:');
  console.log(`   Norwegian drawings: ${drawingsNo}`);
  console.log(`   Swedish drawings: ${drawingsSv}`);

  // Check if Norwegian subcategory has any drawings at all
  if (drawingsNo === 0) {
    console.log('\n🚨 CRITICAL ISSUE FOUND:');
    console.log('   The Norwegian subcategory "Fargelegge Bjørn" has NO drawings!');
    console.log('   This means there is no content to translate.');
    console.log('\n💡 SOLUTION:');
    console.log('   1. Add Norwegian bear drawings to the "Fargelegge Bjørn" subcategory in Sanity');
    console.log('   2. OR check if the drawings are in a different subcategory');
    console.log('   3. Then run the translation script again');
  }

  if (drawingsSv === 0) {
    console.log('\n❌ ISSUE FOUND: No Swedish drawings in this subcategory!');
    console.log('   This is why the Swedish page shows no coloring images.');
  }

  // Get a sample of Swedish drawings if they exist
  if (drawingsSv > 0) {
    const sampleDrawings = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref == $subcategoryId && language == "sv"][0...3] {
        _id,
        title,
        "slug": slug.current,
        isActive
      }
    `, { subcategoryId: svBearAnimal._id });

    console.log('\nSample Swedish drawings:');
    console.log(JSON.stringify(sampleDrawings, null, 2));
  } else {
    console.log('\n❌ ISSUE CONFIRMED: No Swedish drawings in this subcategory!');
    console.log('   The subcategory exists but has 0 translated drawings.');
    console.log('\n💡 SOLUTION: Run translation script to translate drawings from Norwegian to Swedish.');
  }
}


checkBjornDrawings().catch(console.error);
