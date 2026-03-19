const { createClient } = require('@sanity/client');
const fs = require('fs');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkAllFlags() {
  try {
    // Query all drawing images in the flags subcategory
    const query = `*[_type == "drawingImage" && references(*[_type == "subcategory" && slug.current == "fargelegge-flagg"]._id)] {
      _id,
      title,
      "slug": slug.current,
      geography
    } | order(title asc)`;

    const results = await client.fetch(query);

    console.log('\n=== FLAGS IN SANITY ===\n');
    console.log(`Total flags found: ${results.length}\n`);

    // Extract country names from geography
    const countriesInSanity = results.map(flag => {
      const countryName = flag.geography?.countryName || flag.title || 'Unknown';
      return countryName;
    });

    console.log('Countries in Sanity (sorted):');
    countriesInSanity.sort().forEach((country, i) => {
      console.log(`${i + 1}. ${country}`);
    });

    // Read the CSV with all countries
    const csvPath = 'C:\\Users\\Petter\\Downloads\\World_Flags_List - World_Flags_List.csv.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const csvLines = csvContent.split('\n').slice(1); // Skip header
    const allCountries = [];

    csvLines.forEach(line => {
      if (!line.trim()) return;
      const match = line.match(/^"?([^",]+)"?,\s*([A-Z]{2})/);
      if (match) {
        allCountries.push({
          name: match[1].trim(),
          code: match[2].trim()
        });
      }
    });

    console.log(`\n\n=== COMPARISON ===`);
    console.log(`Total in CSV: ${allCountries.length}`);
    console.log(`Total in Sanity: ${results.length}`);
    console.log(`Missing: ${allCountries.length - results.length}`);

    // Simple check - we can't easily match Norwegian to English names
    // So just show the counts
    console.log('\n=== NOTE ===');
    console.log('Since Sanity has Norwegian country names and CSV has English names,');
    console.log('we cannot automatically match them. Use the previous comparison instead.');
    console.log('\nSanity has Norwegian names like:');
    console.log('- "Afghanistan", "Albania", "Norge" (Norway), "Sverige" (Sweden), etc.');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

checkAllFlags();
