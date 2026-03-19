const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function checkMetadataCoverage() {
  const subcategoryId = '384b514f-afb7-48fd-b0df-a4bab192065b';

  const stats = await client.fetch(`
    *[_type == "subcategory" && _id == $id][0] {
      title,
      "totalFlags": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == "no"]),
      "flagsWithMetadata": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == "no" && defined(flagMetadata)]),
      "flagsWithFlagInfo": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == "no" && defined(flagMetadata.flagInfo)]),
      "flagsWithColors": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == "no" && defined(flagMetadata.flagInfo.flagColors)])
    }
  `, { id: subcategoryId });

  console.log('\n=== FLAG METADATA COVERAGE ===\n');
  console.log('Subcategory:', stats.title);
  console.log('\nTotal active flags:', stats.totalFlags);
  console.log('Flags with flagMetadata:', stats.flagsWithMetadata);
  console.log('Flags with flagInfo:', stats.flagsWithFlagInfo);
  console.log('Flags with flagColors:', stats.flagsWithColors);
  console.log('\nREADY FOR FILTERING:', stats.flagsWithColors === stats.totalFlags ? 'YES ✅' : 'NO ❌');

  if (stats.flagsWithColors < stats.totalFlags) {
    console.log('\n⚠️  Some flags are missing flagInfo data needed for filtering!');
    console.log(`Missing: ${stats.totalFlags - stats.flagsWithColors} flags\n`);

    const missing = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref == $id && isActive == true && language == "no" && !defined(flagMetadata.flagInfo)][0...5] {
        _id,
        title,
        "slug": slug.current
      }
    `, { id: subcategoryId });

    console.log('Sample of flags missing flagInfo:');
    missing.forEach((flag, i) => {
      console.log(`  ${i + 1}. ${flag.title} (${flag.slug})`);
    });
  }
}

checkMetadataCoverage();
