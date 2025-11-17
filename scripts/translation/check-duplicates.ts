/**
 * Check for duplicate Norwegian subcategories
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function checkDuplicates() {
  const client = getSanityClient();

  const docs = await client.fetch(`
    *[_type == "subcategory" && language == "no" && isActive == true]{
      _id,
      title,
      "slug": slug.current
    } | order(title asc)
  `);

  console.log(`\n📊 Checking ${docs.length} Norwegian subcategories for duplicates...\n`);

  const titles: Record<string, any[]> = {};
  docs.forEach((d: any) => {
    if (titles[d.title]) {
      titles[d.title].push(d);
    } else {
      titles[d.title] = [d];
    }
  });

  const duplicates = Object.entries(titles).filter(([, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log('✓ No duplicates found!');
    return;
  }

  console.log(`❌ Found ${duplicates.length} duplicate titles:\n`);

  duplicates.forEach(([title, arr]) => {
    console.log(`\n"${title}" (${arr.length} copies):`);
    arr.forEach((doc: any) => {
      console.log(`  - ID: ${doc._id}`);
      console.log(`    Slug: ${doc.slug}`);
    });
  });

  // Check Swedish translations
  console.log('\n\n📊 Checking Swedish translations...\n');

  const swedishDocs = await client.fetch(`
    *[_type == "subcategory" && language == "sv"]{
      _id,
      title,
      baseDocumentId,
      "slug": slug.current
    } | order(title asc)
  `);

  console.log(`Found ${swedishDocs.length} Swedish subcategories\n`);

  const swedishTitles: Record<string, any[]> = {};
  swedishDocs.forEach((d: any) => {
    if (swedishTitles[d.title]) {
      swedishTitles[d.title].push(d);
    } else {
      swedishTitles[d.title] = [d];
    }
  });

  const swedishDuplicates = Object.entries(swedishTitles).filter(([, arr]) => arr.length > 1);

  if (swedishDuplicates.length > 0) {
    console.log(`❌ Found ${swedishDuplicates.length} duplicate Swedish titles:\n`);

    swedishDuplicates.forEach(([title, arr]) => {
      console.log(`\n"${title}" (${arr.length} copies):`);
      arr.forEach((doc: any) => {
        console.log(`  - ID: ${doc._id}`);
        console.log(`    Slug: ${doc.slug}`);
        console.log(`    Base: ${doc.baseDocumentId}`);
      });
    });
  } else {
    console.log('✓ No duplicate Swedish titles');
  }
}

checkDuplicates();
