/**
 * Translate Feiring category with all its subcategories and drawings to German
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function getFeiringSubcategoryIds() {
  // Get Norwegian Feiring category ID
  const feiringCategory = await client.fetch(
    `*[_type == 'category' && language == 'no' && title match 'Feiring*'][0]._id`
  );

  if (!feiringCategory) {
    throw new Error('Feiring category not found');
  }

  console.log(`Found Feiring category: ${feiringCategory}`);

  // Get all subcategories under Feiring
  const subcategories = await client.fetch(
    `*[_type == 'subcategory' && language == 'no' && references($categoryId)]{_id, title}`,
    { categoryId: feiringCategory }
  );

  console.log(`\nSubcategories under Feiring:`);
  subcategories.forEach((sub, i) => {
    console.log(`  ${i + 1}. ${sub.title} (${sub._id})`);
  });

  return subcategories.map(s => s.title);
}

getFeiringSubcategoryIds().catch(console.error);
