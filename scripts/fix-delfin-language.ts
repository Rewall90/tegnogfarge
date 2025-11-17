import dotenv from 'dotenv';
import { getSanityClient } from './translation/sanity-client';

dotenv.config();

async function fixDelfinLanguage() {
  const client = getSanityClient();
  console.log('\n🔧 Fixing language field for Fargelegge Delfin drawings...\n');

  const subcategoryId = '38faa169-2f7c-41a4-955e-fe199a406f8d'; // Fargelegge Delfin

  // Find all drawings in this subcategory without language set
  const drawings = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $subcatId && !defined(language)] {
      _id,
      title,
      language
    }
  `, { subcatId: subcategoryId });

  console.log(`Found ${drawings.length} drawings without language field\n`);

  if (drawings.length === 0) {
    console.log('✅ All drawings already have language field set!');
    return;
  }

  // Update each drawing to set language = "no"
  let successCount = 0;
  let failedCount = 0;

  for (const drawing of drawings) {
    try {
      await client
        .patch(drawing._id)
        .set({ language: 'no' })
        .commit();

      console.log(`✓ ${drawing.title}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to update ${drawing.title}:`, error);
      failedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✓ Updated: ${successCount}`);
  console.log(`   ✗ Failed: ${failedCount}`);
  console.log(`\n✅ Language field fixed! Now you can run the translation script.`);
}

fixDelfinLanguage().catch(console.error);
