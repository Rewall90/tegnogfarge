/**
 * Fix language field for all flag drawings
 * Sets language = "no" for all drawings in the "fargelegge-flagg" subcategory
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function fixFlagLanguages() {
  const client = getSanityClient();

  console.log('\n=== FIXING FLAG DRAWINGS LANGUAGE FIELD ===\n');

  // Step 1: Get the subcategory ID
  const subcategory = await client.fetch(`
    *[_type == "subcategory" && slug.current == "fargelegge-flagg"][0] {
      _id,
      title,
      language
    }
  `);

  if (!subcategory) {
    console.error('❌ ERROR: Could not find subcategory "fargelegge-flagg"');
    return;
  }

  console.log(`✓ Found subcategory: "${subcategory.title}" (language: ${subcategory.language})\n`);

  // Step 2: Get all flag drawings with language = null
  const flagsToUpdate = await client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $subcategoryId && (language == null || !defined(language))] {
      _id,
      title,
      language,
      "slug": slug.current
    }
  `, { subcategoryId: subcategory._id });

  console.log(`Found ${flagsToUpdate.length} flag drawings with language = null\n`);

  if (flagsToUpdate.length === 0) {
    console.log('✅ No flags to update! All flags already have language set.\n');
    return;
  }

  // Step 3: Show sample of what will be updated
  console.log('Sample of flags to be updated:');
  flagsToUpdate.slice(0, 5).forEach((flag: any, i: number) => {
    console.log(`  ${i + 1}. ${flag.title}`);
  });
  if (flagsToUpdate.length > 5) {
    console.log(`  ... and ${flagsToUpdate.length - 5} more\n`);
  }

  console.log('Starting bulk update...\n');

  // Step 4: Update in batches
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: string; title: string; error: string }> = [];

  for (let i = 0; i < flagsToUpdate.length; i += batchSize) {
    const batch = flagsToUpdate.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(flagsToUpdate.length / batchSize);

    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

    // Create transaction for this batch
    const transaction = client.transaction();

    batch.forEach((flag: any) => {
      transaction.patch(flag._id, {
        set: { language: 'no' }
      });
    });

    try {
      await transaction.commit();
      successCount += batch.length;
      console.log(`  ✓ Success: Updated ${batch.length} flags`);
    } catch (error: any) {
      errorCount += batch.length;
      console.error(`  ✗ Error updating batch:`, error.message);

      // Track individual errors
      batch.forEach((flag: any) => {
        errors.push({
          id: flag._id,
          title: flag.title,
          error: error.message
        });
      });
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
    console.log('\nFailed flags:');
    errors.forEach(err => {
      console.log(`  - ${err.title} (${err.id})`);
      console.log(`    Error: ${err.error}`);
    });
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
    console.log('The flags should now appear on the webpage!\n');
  } else {
    console.log('\n⚠️  WARNING: Some flags still have language = null');
    console.log('You may need to run this script again or manually check these in Sanity Studio\n');
  }
}

fixFlagLanguages();
