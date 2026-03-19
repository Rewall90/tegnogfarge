const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function inspectFlagData() {
  const subcategoryId = '384b514f-afb7-48fd-b0df-a4bab192065b';

  console.log('\n=== INSPECTING FLAG DATA STRUCTURE ===\n');

  // Get a few sample flags with all their data
  const samples = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $id && isActive == true && language == "no"][0...3] {
      _id,
      title,
      "slug": slug.current,
      difficulty,
      flagMetadata
    }
  `, { id: subcategoryId });

  samples.forEach((flag, index) => {
    console.log(`\n--- FLAG ${index + 1}: ${flag.title} ---`);
    console.log('Slug:', flag.slug);
    console.log('Difficulty:', flag.difficulty || 'NOT SET');
    console.log('\nflagMetadata structure:');
    
    if (flag.flagMetadata) {
      console.log('  ✓ flagMetadata exists');
      console.log('  Keys:', Object.keys(flag.flagMetadata).join(', '));
      
      // Check each section
      if (flag.flagMetadata.geography) {
        console.log('\n  geography:');
        console.log('    continent:', flag.flagMetadata.geography.continent || 'MISSING');
        console.log('    subRegion:', flag.flagMetadata.geography.subRegion || 'MISSING');
        console.log('    countryName:', flag.flagMetadata.geography.countryName || 'MISSING');
      } else {
        console.log('\n  geography: NOT SET');
      }

      if (flag.flagMetadata.flagInfo) {
        console.log('\n  flagInfo:');
        console.log('    flagColors:', flag.flagMetadata.flagInfo.flagColors || 'MISSING');
        console.log('    colorCount:', flag.flagMetadata.flagInfo.colorCount || 'MISSING');
        console.log('    flagSymbol:', flag.flagMetadata.flagInfo.flagSymbol || 'MISSING');
        console.log('    flagPattern:', flag.flagMetadata.flagInfo.flagPattern || 'MISSING');
      } else {
        console.log('\n  flagInfo: NOT SET ❌');
      }

      if (flag.flagMetadata.countryInfo) {
        console.log('\n  countryInfo:');
        console.log('    capital:', flag.flagMetadata.countryInfo.capital || 'MISSING');
        console.log('    currency:', flag.flagMetadata.countryInfo.currency || 'MISSING');
        console.log('    officialLanguage:', flag.flagMetadata.countryInfo.officialLanguage || 'MISSING');
      } else {
        console.log('\n  countryInfo: NOT SET');
      }

      if (flag.flagMetadata.locationInfo) {
        console.log('\n  locationInfo:');
        console.log('    isIsland:', flag.flagMetadata.locationInfo.isIsland);
        console.log('    hemisphere:', flag.flagMetadata.locationInfo.hemisphere || 'MISSING');
      } else {
        console.log('\n  locationInfo: NOT SET');
      }

      if (flag.flagMetadata.funLearning) {
        console.log('\n  funLearning:');
        console.log('    funFact:', flag.flagMetadata.funLearning.funFact ? 'EXISTS' : 'MISSING');
      } else {
        console.log('\n  funLearning: NOT SET');
      }
    } else {
      console.log('  ✗ flagMetadata DOES NOT EXIST');
    }
  });

  // Get aggregate statistics
  console.log('\n\n=== AGGREGATE STATISTICS FOR ALL 214 FLAGS ===\n');

  const stats = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $id && isActive == true && language == "no"] {
      "hasGeography": defined(flagMetadata.geography),
      "hasContinent": defined(flagMetadata.geography.continent),
      "hasCountryName": defined(flagMetadata.geography.countryName),
      "hasFlagInfo": defined(flagMetadata.flagInfo),
      "hasFlagColors": defined(flagMetadata.flagInfo.flagColors),
      "hasCountryInfo": defined(flagMetadata.countryInfo),
      "hasLocationInfo": defined(flagMetadata.locationInfo),
      "hasFunLearning": defined(flagMetadata.funLearning),
      "hasDifficulty": defined(difficulty)
    }
  `, { id: subcategoryId });

  const totals = {
    hasGeography: stats.filter(s => s.hasGeography).length,
    hasContinent: stats.filter(s => s.hasContinent).length,
    hasCountryName: stats.filter(s => s.hasCountryName).length,
    hasFlagInfo: stats.filter(s => s.hasFlagInfo).length,
    hasFlagColors: stats.filter(s => s.hasFlagColors).length,
    hasCountryInfo: stats.filter(s => s.hasCountryInfo).length,
    hasLocationInfo: stats.filter(s => s.hasLocationInfo).length,
    hasFunLearning: stats.filter(s => s.hasFunLearning).length,
    hasDifficulty: stats.filter(s => s.hasDifficulty).length,
  };

  console.log('Data Coverage (out of 214 flags):');
  console.log('  Geography section:', totals.hasGeography);
  console.log('    - Continent:', totals.hasContinent);
  console.log('    - Country Name:', totals.hasCountryName);
  console.log('  FlagInfo section:', totals.hasFlagInfo, totals.hasFlagInfo === 0 ? '❌ CRITICAL' : '');
  console.log('    - Flag Colors:', totals.hasFlagColors, totals.hasFlagColors === 0 ? '❌ CRITICAL' : '');
  console.log('  CountryInfo section:', totals.hasCountryInfo);
  console.log('  LocationInfo section:', totals.hasLocationInfo);
  console.log('  FunLearning section:', totals.hasFunLearning);
  console.log('  Difficulty field:', totals.hasDifficulty);

  console.log('\n');
}

inspectFlagData();
