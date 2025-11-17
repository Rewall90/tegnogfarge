/**
 * Check Swedish drawing images
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function checkSwedishDrawings() {
  const client = getSanityClient();

  console.log('🔍 Checking Swedish drawing images...\n');

  // Get all Swedish drawing images
  const swedishDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "sv"] | order(_createdAt desc) {
      _id,
      title,
      _createdAt,
      "slug": slug.current,
      baseDocumentId
    }
  `);

  console.log(`Total Swedish drawing images: ${swedishDrawings.length}\n`);

  if (swedishDrawings.length > 0) {
    console.log('Recently created (last 20):\n');
    swedishDrawings.slice(0, 20).forEach((d: any, i: number) => {
      console.log(`${i + 1}. "${d.title}"`);
      console.log(`   ID: ${d._id}`);
      console.log(`   Slug: ${d.slug}`);
      console.log(`   Created: ${new Date(d._createdAt).toISOString()}`);
      console.log(`   Base: ${d.baseDocumentId || 'null'}\n`);
    });
  } else {
    console.log('⚠️  No Swedish drawing images found!\n');
  }

  // Check Norwegian drawing images for comparison
  const norwegianDrawings = await client.fetch(`
    count(*[_type == "drawingImage" && language == "no" && isActive == true && !(_id in path("drafts.**"))])
  `);

  console.log(`Norwegian drawing images (active, published): ${norwegianDrawings}\n`);
}

checkSwedishDrawings();
