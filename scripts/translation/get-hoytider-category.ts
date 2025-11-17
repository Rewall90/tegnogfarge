#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { initSanityClient } from './sanity-client';

dotenv.config();

async function getHoytiderCategory() {
  const client = initSanityClient();

  const HOYTIDER_CATEGORY_ID = '1051a947-76de-41db-acd9-5f88cc18d3ae';

  // Find the høytider category
  const hoytiderCategory = await client.fetch(`
    *[_type == "category" && _id == $categoryId && language == "no"][0] {
      _id,
      title,
      "slug": slug.current
    }
  `, { categoryId: HOYTIDER_CATEGORY_ID });

  if (!hoytiderCategory) {
    console.log('❌ Could not find høytider category\n');
    return;
  }

  console.log('='.repeat(70));
  console.log('\n🎉 Found "høytider" category:\n');
  console.log(`   Title: ${hoytiderCategory.title}`);
  console.log(`   Slug: ${hoytiderCategory.slug}`);
  console.log(`   ID: ${hoytiderCategory._id}\n`);

  // Get all subcategories in this category
  const subcategories = await client.fetch(`
    *[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      "norwegianDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]),
      "swedishDrawings": count(*[_type == "drawingImage" && language == "sv" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]._id])
    }
  `, { categoryId: HOYTIDER_CATEGORY_ID });

  console.log('='.repeat(70));
  console.log(`\n📊 Subcategories in "${hoytiderCategory.title}":\n`);
  console.log(`Found ${subcategories.length} subcategories:\n`);

  subcategories.forEach((sub: any, idx: number) => {
    const remaining = sub.norwegianDrawings - sub.swedishDrawings;
    const percentage = sub.norwegianDrawings > 0
      ? ((sub.swedishDrawings / sub.norwegianDrawings) * 100).toFixed(1)
      : '0.0';
    const status = remaining === 0 ? '✅' : '⏳';

    console.log(`${idx + 1}. ${status} ${sub.title}`);
    console.log(`   Slug: ${sub.slug}`);
    console.log(`   ID: ${sub._id}`);
    console.log(`   Norwegian: ${sub.norwegianDrawings}, Swedish: ${sub.swedishDrawings}, Remaining: ${remaining} (${percentage}%)\n`);
  });

  const totalNorwegian = subcategories.reduce((sum: number, sub: any) => sum + sub.norwegianDrawings, 0);
  const totalSwedish = subcategories.reduce((sum: number, sub: any) => sum + sub.swedishDrawings, 0);
  const totalRemaining = totalNorwegian - totalSwedish;

  console.log('='.repeat(70));
  console.log('\n📈 Total Statistics:\n');
  console.log(`   Total Norwegian drawings: ${totalNorwegian}`);
  console.log(`   Total Swedish drawings: ${totalSwedish}`);
  console.log(`   Total remaining: ${totalRemaining}`);
  console.log(`   Progress: ${((totalSwedish / totalNorwegian) * 100).toFixed(1)}%\n`);
  console.log('='.repeat(70) + '\n');
}

getHoytiderCategory().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
