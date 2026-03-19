const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkExistingSeoTitles() {
  try {
    const query = `*[_type == "subcategory" && defined(seoTitle)] | order(_createdAt desc) [0...10] {
      _id,
      title,
      "slug": slug.current,
      seoTitle,
      seoDescription,
      language,
      parentCategory->{
        title,
        "slug": slug.current
      }
    }`;

    const results = await client.fetch(query);

    console.log('\n=== EXISTING SEO TITLES (Top 10 Subcategories) ===\n');
    
    results.forEach((sub, index) => {
      console.log(`\n--- Example ${index + 1} ---`);
      console.log('Title:', sub.title);
      console.log('SEO Title:', sub.seoTitle);
      console.log('SEO Title Length:', sub.seoTitle ? sub.seoTitle.length : 0);
      console.log('Parent:', sub.parentCategory?.title);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkExistingSeoTitles();
