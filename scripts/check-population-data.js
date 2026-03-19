const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function checkPopulationData() {
  const subcategoryId = '384b514f-afb7-48fd-b0df-a4bab192065b';

  console.log('\n=== POPULATION DATA CHECK ===\n');

  // Get sample flags with population
  const samples = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $id && isActive == true && language == "no"][0...10] {
      title,
      "population": flagMetadata.countryInfo.population
    }
  `, { id: subcategoryId });

  console.log('Sample of 10 flags:');
  samples.forEach((flag, i) => {
    const pop = flag.population 
      ? flag.population.toLocaleString('no-NO') + ' people'
      : 'MISSING';
    console.log(`  ${i + 1}. ${flag.title}: ${pop}`);
  });

  // Count how many have population data
  const withPopulation = await client.fetch(`
    count(*[_type == "drawingImage" && subcategory._ref == $id && isActive == true && language == "no" && defined(flagMetadata.countryInfo.population)])
  `, { id: subcategoryId });

  console.log(`\n✓ Flags with population data: ${withPopulation}/214`);

  if (withPopulation === 214) {
    console.log('✅ All flags have population data!\n');
    
    // Get population range
    const allPops = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref == $id && isActive == true && language == "no" && defined(flagMetadata.countryInfo.population)] {
        title,
        "population": flagMetadata.countryInfo.population
      } | order(population asc)
    `, { id: subcategoryId });

    const smallest = allPops[0];
    const largest = allPops[allPops.length - 1];

    console.log('Population range:');
    console.log(`  Smallest: ${smallest.title} - ${smallest.population.toLocaleString('no-NO')} people`);
    console.log(`  Largest: ${largest.title} - ${largest.population.toLocaleString('no-NO')} people`);
    console.log('');
  } else {
    console.log('⚠️  Some flags are missing population data\n');
  }
}

checkPopulationData();
