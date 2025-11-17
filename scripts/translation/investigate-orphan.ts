/**
 * Investigate the orphaned Swedish subcategory
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function investigate() {
  const client = getSanityClient();

  const orphanId = 'subcategory-bce205b0-0380-4f31-b176-dc8856bbdc45';

  console.log('🔍 Investigating orphaned Swedish subcategory...\n');

  // Get the orphaned Swedish subcategory
  const swedishDoc = await client.fetch(
    `*[_id == $id][0]{
      _id,
      _createdAt,
      _updatedAt,
      title,
      description,
      "slug": slug.current,
      baseDocumentId,
      language,
      isActive,
      parentCategory->{
        _id,
        title,
        "slug": slug.current,
        language
      }
    }`,
    { id: orphanId }
  );

  console.log('Swedish Subcategory:');
  console.log('  Title:', swedishDoc.title);
  console.log('  Slug:', swedishDoc.slug);
  console.log('  Created:', new Date(swedishDoc._createdAt).toISOString());
  console.log('  Updated:', new Date(swedishDoc._updatedAt).toISOString());
  console.log('  baseDocumentId:', swedishDoc.baseDocumentId || 'null');
  console.log('  isActive:', swedishDoc.isActive);
  console.log('  Parent Category:', swedishDoc.parentCategory?.title, `(${swedishDoc.parentCategory?.language})`);
  console.log('  Parent Category ID:', swedishDoc.parentCategory?._id);
  console.log('  Description:', swedishDoc.description?.substring(0, 100) + '...');

  // Check for Norwegian subcategories with similar titles
  console.log('\n🔍 Searching for Norwegian subcategories with similar titles...\n');

  const norwegianDocs = await client.fetch(`
    *[_type == "subcategory" && language == "no" && (
      title match "*Mandala*" ||
      title match "*Blomst*" ||
      slug.current match "*mandala*" ||
      slug.current match "*blomst*"
    )]{
      _id,
      title,
      "slug": slug.current,
      isActive,
      parentCategory->{title, language}
    }
  `);

  console.log(`Found ${norwegianDocs.length} Norwegian subcategories with similar titles:`);
  norwegianDocs.forEach((doc: any) => {
    console.log(`\n  "${doc.title}" (${doc.isActive ? 'active' : 'inactive'})`);
    console.log(`    ID: ${doc._id}`);
    console.log(`    Slug: ${doc.slug}`);
    console.log(`    Parent: ${doc.parentCategory?.title} (${doc.parentCategory?.language})`);
  });

  // Check what drawing images reference this orphaned subcategory
  console.log('\n🔍 Checking drawing images that reference this subcategory...\n');

  const referencingDrawings = await client.fetch(`
    *[_type == "drawingImage" && references($id)]{
      _id,
      title,
      language,
      "slug": slug.current,
      isActive
    }
  `, { id: orphanId });

  console.log(`Found ${referencingDrawings.length} drawing images referencing this subcategory:`);
  referencingDrawings.forEach((doc: any) => {
    console.log(`\n  "${doc.title}" (${doc.language}, ${doc.isActive ? 'active' : 'inactive'})`);
    console.log(`    ID: ${doc._id}`);
    console.log(`    Slug: ${doc.slug}`);
  });

  console.log('\n');
}

investigate();
