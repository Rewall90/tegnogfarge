import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function check() {
  const client = getSanityClient();

  const sub = await client.fetch(`
    *[_id == "c401dc9a-c605-45ad-ab0e-c476d31b304b"][0]{
      _id,
      title,
      "slug": slug.current,
      language,
      isActive
    }
  `);

  console.log('\n🔍 Missing Subcategory:');
  console.log('  Title:', sub.title);
  console.log('  Slug:', sub.slug);
  console.log('  Language:', sub.language);
  console.log('  isActive:', sub.isActive);

  const count = await client.fetch(`
    count(*[_type == "drawingImage" && language == "no" && subcategory._ref == "c401dc9a-c605-45ad-ab0e-c476d31b304b"])
  `);

  console.log('  Drawings in this subcategory:', count);

  // Check if Swedish translation exists
  const swedishVersion = await client.fetch(`
    *[_type == "subcategory" && language == "sv" && baseDocumentId == "c401dc9a-c605-45ad-ab0e-c476d31b304b"][0]{
      _id,
      title
    }
  `);

  if (swedishVersion) {
    console.log('  ✓ Swedish translation exists:', swedishVersion.title);
  } else {
    console.log('  ✗ No Swedish translation found');
  }

  console.log();
}

check();
