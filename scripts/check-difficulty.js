const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function checkDifficulty() {
  const flags = await client.fetch(`
    *[_type == "drawingImage" && subcategory->slug.current == "fargelegge-flagg" && isActive == true && language == "no"] {
      _id,
      title,
      difficulty
    }
  `);

  const total = flags.length;
  const withDifficulty = flags.filter(f => f.difficulty).length;
  const noDifficulty = flags.filter(f => !f.difficulty).length;

  console.log('Total flags:', total);
  console.log('With difficulty:', withDifficulty);
  console.log('Without difficulty:', noDifficulty);

  if (noDifficulty > 0) {
    console.log('\nFlags without difficulty:');
    flags.filter(f => !f.difficulty).slice(0, 5).forEach(f => {
      console.log(`  - ${f.title}`);
    });
  }
}

checkDifficulty();
