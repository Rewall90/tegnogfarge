const { createClient } = require('@sanity/client');

// Sanity client configuration
const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// List of copyrighted character names to search for
const copyrightedCharacters = [
  { name: 'Pokemon', variations: ['pokemon', 'pokémon'] },
  { name: 'Paw Patrol', variations: ['paw patrol', 'paw-patrol', 'pawpatrol'] },
  { name: 'Svampebobb (SpongeBob)', variations: ['svampebobb', 'spongebob', 'svampe-bobb'] },
  { name: 'Ole Brumm (Winnie the Pooh)', variations: ['ole brumm', 'ole-brumm', 'winnie', 'pooh'] },
  { name: 'Ninjago', variations: ['ninjago', 'lego ninjago'] },
  { name: 'Minions', variations: ['minions', 'minion'] },
  { name: 'My Little Pony', variations: ['my little pony', 'my-little-pony', 'little pony', 'pony'] },
  { name: 'Hello Kitty', variations: ['hello kitty', 'hello-kitty', 'hellokitty'] },
  { name: 'Harry Potter', variations: ['harry potter', 'harry-potter', 'harrypotter'] },
  { name: 'Elsa', variations: ['elsa', 'frozen'] },
  { name: 'Disney figurer (Disney characters)', variations: ['disney', 'disney figurer', 'disney-figurer'] },
  { name: 'Barbie', variations: ['barbie'] },
  { name: 'Spiderman', variations: ['spiderman', 'spider-man', 'spider man'] },
  { name: 'Sonic', variations: ['sonic'] },
  { name: 'Mario', variations: ['mario', 'super mario'] },
  { name: 'Deadpool', variations: ['deadpool', 'dead pool'] },
  { name: 'Captain America', variations: ['captain america', 'captain-america'] }
];

async function detailedCopyrightAnalysis() {
  console.log('🔍 Performing detailed copyright analysis...\n');

  try {
    // First, get all subcategories to analyze
    const allSubcategories = await client.fetch(`
      *[_type == "subcategory"] {
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
    `);

    console.log(`📊 Total subcategories in database: ${allSubcategories.length}`);

    const foundCharacters = [];
    const notFoundCharacters = [];

    console.log('\n🎯 Analysis by character:\n');

    for (const character of copyrightedCharacters) {
      const matches = [];

      // Search through all subcategories for matches
      for (const subcategory of allSubcategories) {
        const title = (subcategory.title || '').toLowerCase();
        const slug = (subcategory.slug || '').toLowerCase();

        // Check if any variation matches
        const hasMatch = character.variations.some(variation => {
          const lowerVariation = variation.toLowerCase();
          return title.includes(lowerVariation) || slug.includes(lowerVariation.replace(/\s+/g, '-'));
        });

        if (hasMatch) {
          matches.push(subcategory);
        }
      }

      if (matches.length > 0) {
        foundCharacters.push({ character: character.name, matches });
        console.log(`✅ ${character.name}:`);
        matches.forEach(match => {
          const status = match.isActive ? '🟢' : '🔴';
          console.log(`   ${status} ${match.title} (${match.parentCategory?.title || 'Unknown'}) - ${match.drawingCount} drawings`);
          console.log(`      Slug: ${match.slug}, ID: ${match._id}`);
        });
        console.log('');
      } else {
        notFoundCharacters.push(character.name);
        console.log(`❌ ${character.name}: No matches found`);
        console.log('');
      }
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════');

    console.log(`\n✅ Characters found (${foundCharacters.length}/${copyrightedCharacters.length}):`);
    foundCharacters.forEach(item => {
      const totalDrawings = item.matches.reduce((sum, match) => sum + match.drawingCount, 0);
      const activeCount = item.matches.filter(match => match.isActive).length;
      console.log(`   • ${item.character}: ${item.matches.length} subcategories, ${totalDrawings} drawings (${activeCount} active)`);
    });

    if (notFoundCharacters.length > 0) {
      console.log(`\n❌ Characters not found (${notFoundCharacters.length}):`);
      notFoundCharacters.forEach(character => {
        console.log(`   • ${character}`);
      });
    }

    // Generate removal script data
    const allMatches = foundCharacters.flatMap(item => item.matches);
    const activeMatches = allMatches.filter(match => match.isActive);
    const totalAffectedDrawings = allMatches.reduce((sum, match) => sum + match.drawingCount, 0);

    console.log('\n🚨 IMPACT ANALYSIS:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total copyrighted subcategories: ${allMatches.length}`);
    console.log(`Active subcategories to be deactivated: ${activeMatches.length}`);
    console.log(`Total drawings that will be affected: ${totalAffectedDrawings}`);
    console.log(`Estimated data impact: ${(totalAffectedDrawings * 0.1).toFixed(1)} MB approx.`);

    // Export IDs for bulk operations
    console.log('\n💾 DATA FOR BULK OPERATIONS:');
    console.log('═══════════════════════════════════════════════════════════════');

    const activeIds = activeMatches.map(match => match._id);
    console.log('\n🟢 Active subcategory IDs to deactivate:');
    console.log(JSON.stringify(activeIds, null, 2));

    // Also get the drawing IDs that would be affected
    if (activeIds.length > 0) {
      console.log('\n🔍 Fetching affected drawing IDs...');
      const affectedDrawings = await client.fetch(`
        *[_type == "drawingImage" && subcategory._ref in $subcategoryIds] {
          _id,
          title,
          "subcategoryTitle": subcategory->title
        }
      `, { subcategoryIds: activeIds });

      console.log(`\n📄 Affected drawing IDs (${affectedDrawings.length} total):`);
      console.log('[');
      affectedDrawings.forEach((drawing, index) => {
        const comma = index < affectedDrawings.length - 1 ? ',' : '';
        console.log(`  "${drawing._id}"${comma} // ${drawing.title} (${drawing.subcategoryTitle})`);
      });
      console.log(']');
    }

    return {
      foundCharacters,
      notFoundCharacters,
      totalSubcategories: allMatches.length,
      activeSubcategories: activeMatches.length,
      totalDrawings: totalAffectedDrawings,
      activeSubcategoryIds: activeIds
    };

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  }
}

// Execute the analysis
if (require.main === module) {
  detailedCopyrightAnalysis()
    .then((results) => {
      console.log('\n✅ Detailed analysis completed successfully!');
      console.log('\n🎯 Next steps:');
      console.log('1. Review the found subcategories above');
      console.log('2. Backup your data before making changes');
      console.log('3. Use the provided IDs for bulk deactivation');
      console.log('4. Consider archiving instead of deleting');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { detailedCopyrightAnalysis, copyrightedCharacters };