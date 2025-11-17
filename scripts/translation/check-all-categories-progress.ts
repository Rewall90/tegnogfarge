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

async function checkAllCategoriesProgress() {
  // Get all Norwegian categories
  const categories = await client.fetch(`
    *[_type == "category" && language == "no" && isActive == true] | order(title asc) {
      _id,
      title
    }
  `);

  console.log('📊 TRANSLATION PROGRESS BY CATEGORY\n');
  console.log('='.repeat(80));

  const categoryStats: Array<{
    title: string;
    total: number;
    translated: number;
    remaining: number;
    percentage: number;
  }> = [];

  for (const category of categories) {
    // Get all subcategories under this category
    const subcategories = await client.fetch(`
      *[_type == "subcategory" && language == "no" && parentCategory._ref == $categoryId && isActive == true]{
        _id
      }
    `, { categoryId: category._id });

    let totalDrawings = 0;
    let totalTranslated = 0;

    for (const subcategory of subcategories) {
      // Get all Norwegian drawings in this subcategory
      const drawings = await client.fetch(`
        *[_type == "drawingImage" && language == "no" && isActive == true && subcategory._ref == $subcategoryId && !(_id in path("drafts.**"))]{
          _id
        }
      `, { subcategoryId: subcategory._id });

      // Get Swedish translations
      const drawingIds = drawings.map((d: any) => d._id);
      if (drawingIds.length > 0) {
        const translated = await client.fetch(`
          *[_type == "drawingImage" && language == "sv" && baseDocumentId in $drawingIds]{
            baseDocumentId
          }
        `, { drawingIds });

        const translatedSet = new Set(translated.map((t: any) => t.baseDocumentId));
        totalDrawings += drawings.length;
        totalTranslated += translatedSet.size;
      }
    }

    const remaining = totalDrawings - totalTranslated;
    const percentage = totalDrawings > 0 ? ((totalTranslated / totalDrawings) * 100) : 0;

    categoryStats.push({
      title: category.title,
      total: totalDrawings,
      translated: totalTranslated,
      remaining: remaining,
      percentage: percentage
    });

    const status = remaining === 0 ? '✅' : '⏳';
    console.log(`\n${status} ${category.title}`);
    console.log(`   Total: ${totalDrawings} drawings`);
    console.log(`   Translated: ${totalTranslated} (${percentage.toFixed(1)}%)`);
    if (remaining > 0) {
      console.log(`   Remaining: ${remaining}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📈 SUMMARY\n');

  const totalAll = categoryStats.reduce((sum, cat) => sum + cat.total, 0);
  const translatedAll = categoryStats.reduce((sum, cat) => sum + cat.translated, 0);
  const remainingAll = categoryStats.reduce((sum, cat) => sum + cat.remaining, 0);
  const overallPercentage = totalAll > 0 ? ((translatedAll / totalAll) * 100) : 0;

  console.log(`Total drawings across all categories: ${totalAll}`);
  console.log(`Translated: ${translatedAll} (${overallPercentage.toFixed(1)}%)`);
  console.log(`Remaining: ${remainingAll}\n`);

  const incomplete = categoryStats.filter(cat => cat.remaining > 0);
  if (incomplete.length > 0) {
    console.log(`\nCategories needing translation (${incomplete.length}):\n`);
    incomplete
      .sort((a, b) => b.remaining - a.remaining)
      .forEach(cat => {
        console.log(`  • ${cat.title}: ${cat.remaining} remaining (${cat.total} total, ${cat.percentage.toFixed(1)}% done)`);
      });
  }

  const complete = categoryStats.filter(cat => cat.remaining === 0 && cat.total > 0);
  if (complete.length > 0) {
    console.log(`\n✅ Complete categories (${complete.length}):\n`);
    complete.forEach(cat => {
      console.log(`  • ${cat.title}: ${cat.total} drawings`);
    });
  }
}

checkAllCategoriesProgress().catch(console.error);
