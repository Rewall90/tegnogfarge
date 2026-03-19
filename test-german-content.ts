#!/usr/bin/env ts-node
/**
 * Test script to verify German content in Sanity
 */

import * as dotenv from 'dotenv';
import { getAllCategories, getPopularSubcategories } from './src/lib/sanity';

dotenv.config();

async function testGermanContent() {
  console.log('🔍 Testing German content fetching...\n');

  try {
    // Test categories
    console.log('📁 Fetching German categories...');
    const germanCategories = await getAllCategories('de');
    console.log(`Found ${germanCategories.length} German categories:`);
    germanCategories.forEach((cat: any) => {
      console.log(`  - ${cat.title} (${cat.slug}) - Active: ${cat.isActive}, Featured: ${cat.featured}`);
    });

    console.log('\n📁 Fetching Norwegian categories for comparison...');
    const norwegianCategories = await getAllCategories('no');
    console.log(`Found ${norwegianCategories.length} Norwegian categories`);

    // Test subcategories
    console.log('\n📂 Fetching German subcategories (popular)...');
    const germanSubcategories = await getPopularSubcategories(12, 'de');
    console.log(`Found ${germanSubcategories.length} German subcategories:`);
    germanSubcategories.forEach((sub: any) => {
      console.log(`  - ${sub.title} (${sub.slug})`);
      console.log(`    Parent: ${sub.parentCategory?.title || 'N/A'}`);
      console.log(`    Drawing count: ${sub.drawingCount || 0}`);
    });

    console.log('\n📂 Fetching Norwegian subcategories for comparison...');
    const norwegianSubcategories = await getPopularSubcategories(12, 'no');
    console.log(`Found ${norwegianSubcategories.length} Norwegian subcategories`);

    console.log('\n✅ Test complete!');
    console.log('\nSummary:');
    console.log(`  German categories: ${germanCategories.length}`);
    console.log(`  Norwegian categories: ${norwegianCategories.length}`);
    console.log(`  German subcategories: ${germanSubcategories.length}`);
    console.log(`  Norwegian subcategories: ${norwegianSubcategories.length}`);

    if (germanCategories.length === 0 || germanSubcategories.length === 0) {
      console.log('\n⚠️  WARNING: German content is missing or empty!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGermanContent();
