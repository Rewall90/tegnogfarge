#!/usr/bin/env ts-node

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-01-13',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function checkVitenskapProgress() {
  // Get the Norwegian 'Vitenskap' category
  const vitenskapCategory = await client.fetch(`
    *[_type == "category" && language == "no" && title match "Vitenskap*"][0]{
      _id,
      title
    }
  `);

  if (!vitenskapCategory) {
    console.log('Could not find Vitenskap category');
    return;
  }

  console.log('Found category:', vitenskapCategory.title);
  console.log('Category ID:', vitenskapCategory._id);
  console.log('');

  // Get all subcategories under Vitenskap
  const subcategories = await client.fetch(`
    *[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && isActive == true] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  `, { categoryId: vitenskapCategory._id });

  console.log(`Total subcategories in Vitenskap: ${subcategories.length}\n`);
  console.log('='.repeat(80));

  let totalDrawings = 0;
  let totalTranslated = 0;
  let totalRemaining = 0;
  const incompleteSubcategories: Array<{ title: string; remaining: number; total: number }> = [];

  for (const subcategory of subcategories) {
    // Get all Norwegian drawings in this subcategory (exclude drafts)
    const drawings = await client.fetch(`
      *[_type == "drawingImage" && language == "no" && isActive == true && subcategory._ref == $subcategoryId && !(_id in path("drafts.**"))]{
        _id
      }
    `, { subcategoryId: subcategory._id });

    // Get Swedish translations
    const drawingIds = drawings.map((d: any) => d._id);
    const translated = await client.fetch(`
      *[_type == "drawingImage" && language == "sv" && baseDocumentId in $drawingIds]{
        baseDocumentId
      }
    `, { drawingIds });

    const translatedSet = new Set(translated.map((t: any) => t.baseDocumentId));
    const translatedCount = translatedSet.size;
    const remaining = drawings.length - translatedCount;

    totalDrawings += drawings.length;
    totalTranslated += translatedCount;
    totalRemaining += remaining;

    const percentage = drawings.length > 0 ? ((translatedCount / drawings.length) * 100).toFixed(1) : '0.0';
    const status = remaining === 0 ? '✅' : '⏳';

    console.log(`${status} ${subcategory.title}`);
    console.log(`   ${translatedCount}/${drawings.length} translated (${percentage}%)`);

    if (remaining > 0) {
      console.log(`   ⚠ ${remaining} remaining`);
      incompleteSubcategories.push({
        title: subcategory.title,
        remaining: remaining,
        total: drawings.length
      });
    }
    console.log('');
  }

  console.log('='.repeat(80));
  console.log(`\nVITENSKAP CATEGORY SUMMARY:\n`);
  console.log(`Total drawings: ${totalDrawings}`);
  console.log(`Translated: ${totalTranslated}`);
  console.log(`Remaining: ${totalRemaining}`);
  console.log(`Progress: ${((totalTranslated / totalDrawings) * 100).toFixed(1)}%\n`);

  if (incompleteSubcategories.length > 0) {
    console.log(`Incomplete subcategories (${incompleteSubcategories.length}):\n`);
    incompleteSubcategories
      .sort((a, b) => b.remaining - a.remaining)
      .forEach(sub => {
        console.log(`  • ${sub.title}: ${sub.remaining} remaining (${sub.total} total)`);
      });
  }
}

checkVitenskapProgress().catch(console.error);
