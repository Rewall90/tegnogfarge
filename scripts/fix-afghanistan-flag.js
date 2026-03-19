const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fixAfghanistanFlag() {
  try {
    console.log('Fetching Afghanistan flag document...\n');

    const doc = await client.fetch(`*[_type == "drawingImage" && slug.current == "flagget-til-afghanistan"][0] {
      _id,
      title,
      language,
      flagMetadata
    }`);

    if (!doc) {
      console.error('Afghanistan flag document not found!');
      return;
    }

    console.log('Found document:', doc._id);
    console.log('Current language:', doc.language);
    console.log('Has flagInfo:', !!doc.flagMetadata?.flagInfo);

    // Prepare the update
    const updates = {
      // Set language to Norwegian if not set
      language: doc.language || 'no',

      // Update flagMetadata with missing flagInfo
      flagMetadata: {
        ...doc.flagMetadata,
        flagInfo: {
          flagColors: ['svart', 'rød', 'grønn', 'hvit'],
          flagSymbol: 'Nasjonalt emblem',
          flagPattern: 'Vertical tricolor',
          colorCount: 4,
          flagType: 'National'
        },
        // Optionally add nature and culture if they don't exist
        nature: doc.flagMetadata?.nature || {
          climateZone: 'Continental',
          famousLandmark: 'Band-e-Amir National Park',
          nativeAnimal: 'Snøleopard'
        },
        culture: doc.flagMetadata?.culture || {
          traditionalFood: 'Kabuli Pulao',
          famousSport: 'Buzkashi',
          greeting: 'Salaam',
          localName: 'افغانستان',
          whenIndependent: '1919',
          majorFestival: 'Nawroz',
          nationalFlower: 'Tulipan'
        }
      }
    };

    console.log('\nApplying updates...');
    console.log('New language:', updates.language);
    console.log('New flagInfo:', updates.flagMetadata.flagInfo);

    // Apply the update
    const result = await client
      .patch(doc._id)
      .set(updates)
      .commit();

    console.log('\n✅ Successfully updated Afghanistan flag!');
    console.log('Document ID:', result._id);
    console.log('Updated at:', result._updatedAt);

    // Verify the update
    console.log('\nVerifying update...');
    const updated = await client.fetch(`*[_id == $id][0] {
      _id,
      title,
      language,
      flagMetadata
    }`, { id: doc._id });

    console.log('\nVerified data:');
    console.log('Language:', updated.language);
    console.log('Flag Colors:', updated.flagMetadata?.flagInfo?.flagColors);
    console.log('Color Count:', updated.flagMetadata?.flagInfo?.colorCount);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

fixAfghanistanFlag();
