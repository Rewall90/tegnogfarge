const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fixAllFlagLanguages() {
  try {
    console.log('\n=== FIXING FLAG DRAWINGS LANGUAGE FIELD ===\n');

    // Step 1: Get the subcategory ID
    const subcategory = await client.fetch(`
      *[_type == "subcategory" && slug.current == "fargelegge-flagg"][0] {
        _id,
        title
      }
    `);

    if (!subcategory) {
      console.error('ERROR: Could not find subcategory "fargelegge-flagg"');
      return;
    }

    console.log('Found subcategory:', subcategory.title);

    // Step 2: Get all flag drawings with language = null
    const flagsToUpdate = await client.fetch(`
      *[_type == "drawingImage" && subcategory._ref == $subcategoryId && (language == null || !defined(language))] {
        _id,
        title,
        language
      }
    `, { subcategoryId: subcategory._id });

    console.log(`\nFound ${flagsToUpdate.length} flag drawings with language = null\n`);

    if (flagsToUpdate.length === 0) {
      console.log('No flags to update! All flags already have language set.');
      return;
    }

    // Step 3: Confirm before proceeding
    console.log('First 5 flags to be updated:');
    flagsToUpdate.slice(0, 5).forEach((flag, i) => {
      console.log(`  ${i + 1}. ${flag.title} (${flag._id})`);
    });
    console.log(`  ... and ${flagsToUpdate.length - 5} more\n`);

    console.log('Starting bulk update...\n');

    // Step 4: Update in batches of 10
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < flagsToUpdate.length; i += batchSize) {
      const batch = flagsToUpdate.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flagsToUpdate.length / batchSize)} (${batch.length} items)...`);

      // Create transaction for this batch
      const transaction = client.transaction();

      batch.forEach(flag => {
        transaction.patch(flag._id, {
          set: { language: 'no' }
        });
      });

      try {
        await transaction.commit();
        successCount += batch.length;
        console.log(`  ✅ Success: Updated ${batch.length} flags`);
      } catch (error) {
        errorCount += batch.length;
        console.error(`  ❌ Error updating batch:`, error.message);
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < flagsToUpdate.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n=== UPDATE COMPLETE ===\n');
    console.log(`✅ Successfully updated: ${successCount} flags`);
    if (errorCount > 0) {
      console.log(`❌ Failed to update: ${errorCount} flags`);
    }

    // Step 5: Verify the update
    console.log('\nVerifying update...');
    const afterUpdate = await client.fetch(`
      count(*[_type == "drawingImage" && subcategory._ref == $subcategoryId && language == "no"])
    `, { subcategoryId: subcategory._id });

    console.log(`Total flags with language = "no": ${afterUpdate}`);

    const stillNull = await client.fetch(`
      count(*[_type == "drawingImage" && subcategory._ref == $subcategoryId && (language == null || !defined(language))])
    `, { subcategoryId: subcategory._id });

    console.log(`Flags still with language = null: ${stillNull}`);

    if (stillNull === 0) {
      console.log('\n🎉 SUCCESS! All flags now have language = "no"');
      console.log('The flags should now appear on the webpage!');
    } else {
      console.log('\n⚠️ WARNING: Some flags still have language = null');
      console.log('You may need to manually check these in Sanity Studio');
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

fixAllFlagLanguages();
