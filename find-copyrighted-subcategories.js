const { createClient } = require('@sanity/client');

// Sanity client configuration
const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false, // Use false for write operations or real-time data
  token: process.env.SANITY_API_TOKEN, // Optional: only needed for private datasets or mutations
});

// List of copyrighted character names to search for
const copyrightedCharacters = [
  'Pokemon',
  'Paw Patrol',
  'Svampebobb',
  'SpongeBob',
  'Ole Brumm',
  'Winnie the Pooh',
  'Ninjago',
  'Minions',
  'My Little Pony',
  'Hello Kitty',
  'Harry Potter',
  'Elsa',
  'Disney figurer',
  'Disney characters',
  'Barbie',
  'Spiderman',
  'Sonic',
  'Mario',
  'Deadpool',
  'Captain America'
];

async function findCopyrightedSubcategories() {
  console.log('🔍 Searching for copyrighted character subcategories...\n');

  try {
    // Create a case-insensitive search pattern for both title and slug
    const searchConditions = copyrightedCharacters.map(character => {
      // Convert to lowercase for slug matching (assuming slugs are lowercase)
      const slugPattern = character.toLowerCase()
        .replace(/\s+/g, '-')    // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special characters

      return `(title match "${character}*" || slug.current match "*${slugPattern}*" || title match "*${character}*" || slug.current match "*${character.toLowerCase()}*")`;
    }).join(' || ');

    // GROQ query to find matching subcategories
    const query = `
      *[_type == "subcategory" && (${searchConditions})] {
        _id,
        title,
        "slug": slug.current,
        isActive,
        "parentCategory": parentCategory->{
          _id,
          title,
          "slug": slug.current
        },
        "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id])
      } | order(parentCategory->title asc, title asc)
    `;

    console.log('📝 Executing GROQ query...');
    const results = await client.fetch(query);

    console.log(`\n✅ Found ${results.length} potentially copyrighted subcategories:\n`);

    if (results.length === 0) {
      console.log('🎉 No copyrighted subcategories found in the database.');
      return [];
    }

    // Display results in a formatted table
    console.log('┌─────────────────────────────────────┬─────────────────────────────────────┬──────────────┬────────────┬──────────────┐');
    console.log('│ Subcategory Title                   │ Parent Category                     │ Slug         │ Drawings   │ Active       │');
    console.log('├─────────────────────────────────────┼─────────────────────────────────────┼──────────────┼────────────┼──────────────┤');

    results.forEach(subcategory => {
      const title = (subcategory.title || 'N/A').padEnd(35).substring(0, 35);
      const parentTitle = (subcategory.parentCategory?.title || 'N/A').padEnd(35).substring(0, 35);
      const slug = (subcategory.slug || 'N/A').padEnd(12).substring(0, 12);
      const drawingCount = subcategory.drawingCount.toString().padStart(8);
      const isActive = subcategory.isActive ? 'Yes'.padEnd(12) : 'No'.padEnd(12);

      console.log(`│ ${title} │ ${parentTitle} │ ${slug} │ ${drawingCount} │ ${isActive} │`);
    });

    console.log('└─────────────────────────────────────┴─────────────────────────────────────┴──────────────┴────────────┴──────────────┘');

    // Summary by character
    console.log('\n📊 Summary by character:');
    copyrightedCharacters.forEach(character => {
      const matches = results.filter(result =>
        result.title.toLowerCase().includes(character.toLowerCase()) ||
        result.slug.toLowerCase().includes(character.toLowerCase().replace(/\s+/g, '-'))
      );

      if (matches.length > 0) {
        console.log(`\n🎯 ${character}:`);
        matches.forEach(match => {
          console.log(`   - ${match.title} (${match.parentCategory?.title || 'Unknown category'}) - ${match.drawingCount} drawings`);
          console.log(`     ID: ${match._id}`);
          console.log(`     Slug: ${match.slug}`);
          console.log(`     Active: ${match.isActive ? 'Yes' : 'No'}`);
        });
      }
    });

    // Generate list of IDs for potential bulk operations
    const activeIds = results.filter(r => r.isActive).map(r => r._id);
    const inactiveIds = results.filter(r => !r.isActive).map(r => r._id);

    console.log('\n📋 IDs for potential bulk operations:');
    console.log('\n🟢 Active subcategory IDs:');
    console.log(JSON.stringify(activeIds, null, 2));

    if (inactiveIds.length > 0) {
      console.log('\n🔴 Inactive subcategory IDs:');
      console.log(JSON.stringify(inactiveIds, null, 2));
    }

    // Show total drawing count that would be affected
    const totalDrawings = results.reduce((sum, subcategory) => sum + subcategory.drawingCount, 0);
    console.log(`\n⚠️  Total drawings affected: ${totalDrawings}`);
    console.log(`📦 Total subcategories found: ${results.length}`);
    console.log(`🟢 Active subcategories: ${activeIds.length}`);
    console.log(`🔴 Inactive subcategories: ${inactiveIds.length}`);

    return results;

  } catch (error) {
    console.error('❌ Error querying Sanity:', error);
    throw error;
  }
}

// Execute the search
if (require.main === module) {
  findCopyrightedSubcategories()
    .then(() => {
      console.log('\n✅ Search completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { findCopyrightedSubcategories, copyrightedCharacters };