const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-27',
  useCdn: false,
  token: 'sknlEDAbhtpvWxiREz3aVLH91uEEEEIQ62jDQ8UX6AhteWEL5DuEk2S1iq5sWM7lcoaybBTCqqdHFQ0mEdffTBtVCMlaVkVexdlnfVhmTtQhoMNHM3TZ8CiaMymFOqB1UnH9vA0heILXOQI1nuztrDNngiGiwOqwVuhGoAWeVPwmqDJIJgrz',
});

// Same slugify function as in the schemas
function slugify(input) {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[æ]/g, 'ae')          // Replace æ with ae
    .replace(/[ø]/g, 'o')           // Replace ø with o
    .replace(/[å]/g, 'a')           // Replace å with a
    .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric characters except hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '')          // Remove hyphens from start and end
}

async function regenerateAllSlugs() {
  console.log('🔍 Fetching all documents with slugs...');
  
  try {
    // Fetch all documents that have both title and slug fields
    const query = `*[defined(title) && defined(slug)] {
      _id,
      _type,
      title,
      "currentSlug": slug.current
    }`;
    
    const documents = await client.fetch(query);
    console.log(`📄 Found ${documents.length} documents with slugs`);
    
    if (documents.length === 0) {
      console.log('✅ No documents found to update');
      return;
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    console.log('\n🔄 Processing documents...\n');
    
    for (const doc of documents) {
      const newSlug = slugify(doc.title);
      
      // Skip if slug is already correct
      if (doc.currentSlug === newSlug) {
        console.log(`⏭️  Skipping "${doc.title}" - slug already correct`);
        skippedCount++;
        continue;
      }
      
      console.log(`🔧 Updating "${doc.title}"`);
      console.log(`   Old slug: "${doc.currentSlug}"`);
      console.log(`   New slug: "${newSlug}"`);
      
      try {
        await client
          .patch(doc._id)
          .set({
            slug: {
              _type: 'slug',
              current: newSlug
            }
          })
          .commit();
        
        console.log(`   ✅ Updated successfully\n`);
        updatedCount++;
        
      } catch (error) {
        console.log(`   ❌ Failed to update: ${error.message}\n`);
        errors.push({
          document: doc.title,
          id: doc._id,
          error: error.message
        });
      }
    }
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`✅ Successfully updated: ${updatedCount} documents`);
    console.log(`⏭️  Skipped (already correct): ${skippedCount} documents`);
    console.log(`❌ Errors: ${errors.length} documents`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(err => {
        console.log(`- "${err.document}" (${err.id}): ${err.error}`);
      });
    }
    
    if (updatedCount > 0) {
      console.log('\n🎉 Slug regeneration completed! Norwegian characters (æ, ø, å) have been properly converted.');
    }
    
  } catch (error) {
    console.error('❌ Error fetching documents:', error.message);
    process.exit(1);
  }
}

// Run the regeneration
regenerateAllSlugs(); 