const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkAfghanistanFlag() {
  try {
    const query = `*[_type == "drawingImage" && title match "*afghanistan*" || title match "*Afghanistan*"] {
      _id,
      title,
      "slug": slug.current,
      language,
      difficulty,
      isActive,
      subcategory->{
        _id,
        title,
        "slug": slug.current
      },
      flagMetadata
    }`;

    const results = await client.fetch(query);

    console.log('\n=== AFGHANISTAN FLAG DOCUMENTS ===\n');
    console.log(`Found ${results.length} document(s)\n`);

    results.forEach((doc, index) => {
      console.log(`\n--- Document ${index + 1} ---`);
      console.log('ID:', doc._id);
      console.log('Title:', doc.title);
      console.log('Slug:', doc.slug);
      console.log('Language:', doc.language);
      console.log('Difficulty:', doc.difficulty);
      console.log('Active:', doc.isActive);
      console.log('Subcategory:', doc.subcategory?.title, `(${doc.subcategory?.slug})`);
      console.log('\nFlag Metadata:');
      console.log(JSON.stringify(doc.flagMetadata, null, 2));
    });

    if (results.length === 0) {
      console.log('No Afghanistan flag documents found.');
      console.log('\nSearching for all flag-related documents...\n');

      const allFlags = await client.fetch(`*[_type == "drawingImage" && defined(flagMetadata)] | order(title asc) [0...10] {
        _id,
        title,
        "slug": slug.current,
        language,
        flagMetadata { geography { countryName } }
      }`);

      console.log(`Found ${allFlags.length} documents with flagMetadata:\n`);
      allFlags.forEach((flag, i) => {
        console.log(`${i + 1}. ${flag.title} (${flag.language}) - Country: ${flag.flagMetadata?.geography?.countryName}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

checkAfghanistanFlag();
