import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function check() {
  const client = getSanityClient();

  const drawings = await client.fetch(`
    *[_type == "drawingImage" && language == "no" && subcategory._ref == "c401dc9a-c605-45ad-ab0e-c476d31b304b"]{
      _id,
      title,
      isActive
    }
  `);

  const active = drawings.filter((d: any) => d.isActive === true).length;
  const inactive = drawings.filter((d: any) => d.isActive === false).length;

  console.log('\n📊 Drawings in INACTIVE subcategory "hakkebakkeskogen":');
  console.log('  Total:', drawings.length);
  console.log('  Active:', active);
  console.log('  Inactive:', inactive);
  console.log();

  if (active > 0) {
    console.log('⚠️  WARNING: Active drawings in inactive subcategory!');
    console.log('These should probably be marked as inactive too.\n');
  }
}

check();
