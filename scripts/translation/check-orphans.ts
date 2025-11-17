/**
 * Check for orphaned Swedish translations
 * (Swedish translations where the Norwegian original is inactive or a draft)
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function checkOrphans() {
  const client = getSanityClient();

  // Get all Swedish subcategories
  const swedishDocs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId
    }
  `);

  // Get all active published Norwegian subcategories
  const norwegianDocs = await client.fetch(`
    *[_type == "subcategory" && language == "no" && isActive == true && !(_id in path("drafts.**"))]{
      _id
    }
  `);

  const norwegianIds = new Set(norwegianDocs.map((d: any) => d._id));

  console.log(`\n📊 Checking for orphaned Swedish translations...\n`);
  console.log(`Swedish translations: ${swedishDocs.length}`);
  console.log(`Norwegian (active, published): ${norwegianDocs.length}\n`);

  const orphans = swedishDocs.filter((d: any) => !norwegianIds.has(d.baseDocumentId));

  if (orphans.length === 0) {
    console.log('✓ No orphaned translations found!');
    return;
  }

  console.log(`❌ Found ${orphans.length} orphaned Swedish translations:\n`);

  for (const orphan of orphans) {
    console.log(`"${orphan.title}"`);
    console.log(`  Swedish ID: ${orphan._id}`);
    console.log(`  Points to Norwegian: ${orphan.baseDocumentId}`);

    // Check if Norwegian exists but is inactive or draft
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
    console.log();
  }

  console.log(`\n💡 These Swedish translations should be deleted or deactivated.`);
}

checkOrphans();
