const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function testFlagQuery() {
  const categorySlug = 'vitenskap';
  const subcategorySlug = 'fargelegge-flagg';
  const locale = 'no';

  console.log('\n=== TESTING FLAG QUERY ===\n');
  console.log('Parameters:', { categorySlug, subcategorySlug, locale });

  // Test 1: Check if subcategory exists
  const subcategory = await client.fetch(`
    *[_type == "subcategory" && slug.current == $subcategorySlug && parentCategory->slug.current == $categorySlug && isActive == true && language == $locale][0] {
      _id,
      title,
      language,
      "slug": slug.current
    }
  `, { categorySlug, subcategorySlug, locale });

  console.log('\n1. Subcategory found:', subcategory);

  // Test 2: Count drawings WITH language filter
  const withLangFilter = await client.fetch(`
    count(*[_type == "drawingImage" && subcategory._ref == $subcategoryId && isActive == true && language == $locale])
  `, { subcategoryId: subcategory._id, locale });

  console.log('\n2. Drawings WITH language filter (language == "no"):', withLangFilter);

  // Test 3: Count drawings WITHOUT language filter
  const withoutLangFilter = await client.fetch(`
    count(*[_type == "drawingImage" && subcategory._ref == $subcategoryId && isActive == true])
  `, { subcategoryId: subcategory._id });

  console.log('\n3. Drawings WITHOUT language filter:', withoutLangFilter);

  // Test 4: Sample drawings to check their language field
  const sampleDrawings = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $subcategoryId && isActive == true][0...5] {
      _id,
      title,
      language,
      "slug": slug.current
    }
  `, { subcategoryId: subcategory._id });

  console.log('\n4. Sample drawings (check language field):');
  sampleDrawings.forEach((d, i) => {
    console.log(`   ${i + 1}. "${d.title}" - language: ${d.language === null ? 'NULL' : d.language}`);
  });

  console.log('\n=== DIAGNOSIS ===');
  console.log('If "WITH language filter" = 0 and "WITHOUT language filter" > 0,');
  console.log('then the issue is that flag drawings have language = null instead of "no"');
}

testFlagQuery().catch(console.error);
