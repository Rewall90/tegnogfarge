import * as dotenv from 'dotenv';
import { initSanityClient } from './scripts/translation/sanity-client.ts';

dotenv.config();

const client = initSanityClient();

(async () => {
  const category = await client.fetch(`*[_type == "category" && language == "no" && title match "*Tegneserier*"][0]{ _id, title }`);

  if (!category) {
    console.log('Category not found');
    return;
  }

  console.log('Category:', category.title);
  console.log('Category ID:', category._id);

  const subs = await client.fetch(
    `*[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && !(_id in path("drafts.**"))] | order(title asc) {
      _id,
      title,
      isActive,
      "norwegianDrawings": count(*[_type == "drawingImage" && language == "no" && subcategory._ref == ^._id])
    }`,
    { categoryId: category._id }
  );

  console.log('\nSubcategories:');
  console.log('='.repeat(70));

  let activeCount = 0;
  let inactiveCount = 0;

  subs.forEach(s => {
    const status = s.isActive ? '✓ ACTIVE  ' : '✗ INACTIVE';
    console.log(`${status} | ${s.title.padEnd(30)} | Drawings: ${s.norwegianDrawings}`);
    if (s.isActive) activeCount++;
    else inactiveCount++;
  });

  console.log('='.repeat(70));
  console.log(`\nTotal: ${subs.length} subcategories`);
  console.log(`Active: ${activeCount}`);
  console.log(`Inactive: ${inactiveCount}`);
})();
