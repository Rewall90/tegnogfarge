import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
});

async function findDelfinSubcategory() {
  console.log('\n🔍 Searching for delfin subcategory and drawings...\n');

  // Find all subcategories with "delfin" in slug or title
  const subcats = await client.fetch(`
    *[_type == "subcategory" && (
      slug.current match "*delfin*" ||
      title match "*delfin*" ||
      title match "*Delfin*"
    )] {
      _id,
      title,
      "slug": slug.current,
      language,
      isActive,
      "parentCategory": parentCategory->{
        title,
        "slug": slug.current
      }
    }
  `);

  console.log('Delfin subcategories found:');
  console.log(JSON.stringify(subcats, null, 2));

  // Find Norwegian delfin subcategory
  const norwegianSubcat = subcats.find((s: any) => s.language === 'no');

  if (norwegianSubcat) {
    console.log(`\n✓ Found Norwegian subcategory: "${norwegianSubcat.title}"`);
    console.log(`  ID: ${norwegianSubcat._id}`);
    console.log(`  Slug: ${norwegianSubcat.slug}`);

    // Find all drawings in this subcategory
    const drawings = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref == $subcatId] {
        _id,
        title,
        language,
        isActive
      }
    `, { subcatId: norwegianSubcat._id });

    console.log(`\n📊 Found ${drawings.length} drawings in this subcategory`);

    const withoutLanguage = drawings.filter((d: any) => !d.language);
    console.log(`   ${withoutLanguage.length} drawings without language field`);

    if (withoutLanguage.length > 0) {
      console.log('\nFirst 5 drawings without language:');
      withoutLanguage.slice(0, 5).forEach((d: any) => {
        console.log(`  - ${d.title} (ID: ${d._id})`);
      });
    }
  }
}

findDelfinSubcategory().catch(console.error);
