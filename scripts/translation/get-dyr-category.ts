#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { initSanityClient } from './sanity-client';

dotenv.config();

async function getDyrCategory() {
  const client = initSanityClient();

  // Find the dyr category
  const categories = await client.fetch(`
    *[_type == "category" && language == "no" && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  `);

  console.log('\n📂 All Norwegian Categories:\n');
  categories.forEach((cat: any, idx: number) => {
    console.log(`${idx + 1}. ${cat.title} (${cat.slug})`);
    console.log(`   ID: ${cat._id}\n`);
  });

  // Find dyr category specifically
  const dyrCategory = categories.find((cat: any) =>
    cat.title.toLowerCase().includes('dyr') || cat.slug.includes('dyr')
  );

  if (dyrCategory) {
    console.log('='.repeat(70));
    console.log('\n🐾 Found "dyr" category:\n');
    console.log(`   Title: ${dyrCategory.title}`);
    console.log(`   Slug: ${dyrCategory.slug}`);
    console.log(`   ID: ${dyrCategory._id}\n`);

    // Get all subcategories in this category
    const subcategories = await client.fetch(`
      *[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(title asc) {
        _id,
        title,
        "slug": slug.current,
        "norwegianDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]),
        "swedishDrawings": count(*[_type == "drawingImage" && language == "sv" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id]._id])
      }
    `, { categoryId: dyrCategory._id });

    console.log('='.repeat(70));
    console.log(`\n📊 Subcategories in "${dyrCategory.title}":\n`);
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
  } else {
    console.log('❌ Could not find "dyr" category\n');
  }
}

getDyrCategory().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
