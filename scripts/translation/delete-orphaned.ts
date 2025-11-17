/**
 * Delete orphaned Swedish translations
 * (Swedish translations with null/missing baseDocumentId or pointing to inactive/deleted Norwegian)
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function deleteOrphaned() {
  const client = getSanityClient();

  console.log('📊 Checking for orphaned Swedish translations...\n');

  // Get all Swedish subcategories
  const swedishDocs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId,
      "slug": slug.current
    }
  `);

  // Get all active published Norwegian subcategories
  const norwegianDocs = await client.fetch(`
    *[_type == "subcategory" && language == "no" && isActive == true && !(_id in path("drafts.**"))]{
      _id
    }
  `);

  const norwegianIds = new Set(norwegianDocs.map((d: any) => d._id));

  console.log(`Swedish translations: ${swedishDocs.length}`);
  console.log(`Norwegian (active, published): ${norwegianDocs.length}\n`);

  // Find orphaned translations
  const orphans = swedishDocs.filter((d: any) => {
    // Orphaned if:
    // 1. No baseDocumentId
    // 2. baseDocumentId points to inactive/draft/deleted Norwegian
    return !d.baseDocumentId || !norwegianIds.has(d.baseDocumentId);
  });

  if (orphans.length === 0) {
    console.log('✓ No orphaned translations found!\n');
    return;
  }

  console.log(`❌ Found ${orphans.length} orphaned Swedish translations:\n`);

  for (const orphan of orphans) {
    console.log(`\n"${orphan.title}"`);
    console.log(`  Swedish ID: ${orphan._id}`);
    console.log(`  Slug: ${orphan.slug}`);
    console.log(`  Points to Norwegian: ${orphan.baseDocumentId || 'null (no baseDocumentId)'}`);

    // Check if Norwegian exists but is inactive or draft
    if (orphan.baseDocumentId) {
      const norwegianDoc = await client.fetch(
        `*[_id == $id || _id == $draftId][0]{_id, isActive}`,
        {
          id: orphan.baseDocumentId,
          draftId: `drafts.${orphan.baseDocumentId}`
        }
      );

      if (norwegianDoc) {
        console.log(`  Status: ${norwegianDoc.isActive === false ? 'Inactive' : 'Draft'}`);
      } else {
        console.log(`  Status: Deleted`);
      }
    }

    // Delete the orphaned translation
    console.log(`  ✗ DELETING orphaned Swedish translation...`);

    try {
      await client.delete(orphan._id);
      console.log(`  ✓ Deleted`);
    } catch (error: any) {
      // Check if error is due to references
      if (error.statusCode === 409 && error.details?.items?.[0]?.error?.referencingIDs) {
        const referencingIds = error.details.items[0].error.referencingIDs;
        console.log(`  ⚠️  Cannot delete due to ${referencingIds.length} reference(s):`);

        for (const refId of referencingIds) {
          console.log(`     - ${refId}`);

          // Delete the referencing document first
          console.log(`     ✗ Deleting referencing document...`);
          try {
            await client.delete(refId);
            console.log(`     ✓ Deleted`);
          } catch (refError) {
            console.error(`     ✗ Failed to delete referencing document:`, refError);
          }
        }

        // Now try to delete the orphaned translation again
        console.log(`  ✗ Retrying deletion of orphaned translation...`);
        try {
          await client.delete(orphan._id);
          console.log(`  ✓ Deleted`);
        } catch (retryError) {
          console.error(`  ✗ Failed to delete orphaned translation:`, retryError);
        }
      } else {
        console.error(`  ✗ Failed to delete:`, error.message || error);
      }
    }
  }

  console.log(`\n✅ Orphaned translation cleanup complete!\n`);
}

deleteOrphaned();
