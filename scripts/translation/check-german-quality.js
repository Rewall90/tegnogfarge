const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkGermanCategories() {
  // Fetch all German categories with their full data
  const germanCategories = await client.fetch(
    `*[_type == 'category' && language == 'de'] | order(title asc) {
      _id,
      _type,
      title,
      slug,
      description,
      seoTitle,
      seoDescription,
      language,
      baseDocumentId,
      icon,
      order,
      isActive,
      featured,
      'imageAlt': image.alt,
      'hasImage': defined(image.asset._ref)
    }`
  );

  console.log('\n📊 GERMAN CATEGORY QUALITY CHECK');
  console.log('═'.repeat(80));
  console.log(`Total German categories found: ${germanCategories.length}\n`);

  // Check each category
  let allFieldsComplete = true;

  for (const cat of germanCategories) {
    console.log(`\n📁 Category: ${cat.title}`);
    console.log('─'.repeat(80));
    console.log(`  _id: ${cat._id}`);
    console.log(`  baseDocumentId: ${cat.baseDocumentId || '❌ MISSING'}`);
    console.log(`  language: ${cat.language}`);
    console.log(`  slug: ${cat.slug?.current || '❌ MISSING'}`);
    console.log(`  description: ${cat.description ? (cat.description.substring(0, 60) + '...') : '❌ MISSING'}`);
    console.log(`  seoTitle: ${cat.seoTitle || '❌ MISSING'}`);
    console.log(`  seoDescription: ${cat.seoDescription ? (cat.seoDescription.substring(0, 60) + '...') : '❌ MISSING'}`);
    console.log(`  image.alt: ${cat.imageAlt || '❌ MISSING'}`);
    console.log(`  hasImage: ${cat.hasImage ? '✓' : '❌ MISSING'}`);
    console.log(`  icon: ${cat.icon || '(optional - empty)'}`);
    console.log(`  order: ${cat.order ?? 'not set'}`);
    console.log(`  isActive: ${cat.isActive ?? 'not set'}`);
    console.log(`  featured: ${cat.featured ?? 'not set'}`);

    // Check for missing required fields
    const missingFields = [];
    if (!cat.title) missingFields.push('title');
    if (!cat.slug?.current) missingFields.push('slug');
    if (!cat.description) missingFields.push('description');
    if (!cat.seoTitle) missingFields.push('seoTitle');
    if (!cat.seoDescription) missingFields.push('seoDescription');
    if (!cat.imageAlt) missingFields.push('image.alt');
    if (!cat.baseDocumentId) missingFields.push('baseDocumentId');

    if (missingFields.length > 0) {
      console.log(`  ⚠️  MISSING FIELDS: ${missingFields.join(', ')}`);
      allFieldsComplete = false;
    } else {
      console.log(`  ✓ All required fields present`);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n✓ Quality Check Summary:`);
  console.log(`  - Total categories checked: ${germanCategories.length}`);
  console.log(`  - All required fields complete: ${allFieldsComplete ? '✓ YES' : '✗ NO'}`);

  if (!allFieldsComplete) {
    console.log(`\n⚠️  Some categories have missing fields. Review output above.`);
  }
}

checkGermanCategories().catch(console.error);
