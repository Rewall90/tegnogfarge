const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkFlagsSubcategory() {
  try {
    const query = `*[_type == "subcategory" && (slug.current == "flagg" || slug.current == "fargelegge-flagg")] {
      _id,
      title,
      "slug": slug.current,
      description,
      seoTitle,
      seoDescription,
      language,
      parentCategory->{
        title,
        "slug": slug.current
      }
    }`;

    const results = await client.fetch(query);

    console.log('\n=== FLAGS SUBCATEGORY INFORMATION ===\n');
    console.log(`Found ${results.length} subcategory/subcategories\n`);

    results.forEach((sub, index) => {
      console.log(`\n--- Subcategory ${index + 1} ---`);
      console.log('ID:', sub._id);
      console.log('Title:', sub.title);
      console.log('Slug:', sub.slug);
      console.log('Language:', sub.language);
      console.log('Parent Category:', sub.parentCategory?.title, `(${sub.parentCategory?.slug})`);
      console.log('\nDescription:', sub.description || '(NONE)');
      console.log('\nSEO Title:', sub.seoTitle || '(NONE)');
      console.log('\nSEO Description:', sub.seoDescription || '(NONE)');
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

checkFlagsSubcategory();
