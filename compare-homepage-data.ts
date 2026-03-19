#!/usr/bin/env ts-node
/**
 * Compare homepage data between Norwegian and German
 */

import * as dotenv from 'dotenv';
import { getAllCategories, getPopularSubcategories } from './src/lib/sanity';

dotenv.config();

async function compareHomepageData() {
  console.log('🔍 Comparing homepage data...\n');

  try {
    // Fetch both locales
    const [noCats, deCats] = await Promise.all([
      getAllCategories('no'),
      getAllCategories('de')
    ]);

    const [noSubs, deSubs] = await Promise.all([
      getPopularSubcategories(12, 'no'),
      getPopularSubcategories(12, 'de')
    ]);

    console.log('='.repeat(60));
    console.log('CATEGORIES COMPARISON');
    console.log('='.repeat(60));
    console.log(`Norwegian: ${noCats.length} categories`);
    console.log(`German: ${deCats.length} categories\n`);

    // Check for featured categories
    const noFeatured = noCats.filter((c: any) => c.featured);
    const deFeatured = deCats.filter((c: any) => c.featured);
    console.log(`Norwegian featured: ${noFeatured.length}`);
    console.log(`German featured: ${deFeatured.length}\n`);

    // Check active categories
    const noActive = noCats.filter((c: any) => c.isActive);
    const deActive = deCats.filter((c: any) => c.isActive);
    console.log(`Norwegian active: ${noActive.length}`);
    console.log(`German active: ${deActive.length}\n`);

    console.log('Norwegian categories (first 5):');
    noCats.slice(0, 5).forEach((cat: any) => {
      console.log(`  - ${cat.title} (featured: ${cat.featured}, active: ${cat.isActive}, order: ${cat.order})`);
    });

    console.log('\nGerman categories (first 5):');
    deCats.slice(0, 5).forEach((cat: any) => {
      console.log(`  - ${cat.title} (featured: ${cat.featured}, active: ${cat.isActive}, order: ${cat.order})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('SUBCATEGORIES COMPARISON');
    console.log('='.repeat(60));
    console.log(`Norwegian: ${noSubs.length} subcategories`);
    console.log(`German: ${deSubs.length} subcategories\n`);

    console.log('Norwegian subcategories (first 3):');
    noSubs.slice(0, 3).forEach((sub: any) => {
      console.log(`  - ${sub.title} (${sub.drawingCount} drawings)`);
      console.log(`    Parent: ${sub.parentCategory?.title || 'N/A'}`);
      console.log(`    Has image: ${!!sub.featuredImage}`);
    });

    console.log('\nGerman subcategories (first 3):');
    deSubs.slice(0, 3).forEach((sub: any) => {
      console.log(`  - ${sub.title} (${sub.drawingCount} drawings)`);
      console.log(`    Parent: ${sub.parentCategory?.title || 'N/A'}`);
      console.log(`    Has image: ${!!sub.featuredImage}`);
    });

    // Check what will actually be displayed on homepage
    const noMainCategories = noCats
      .filter((cat: any) => cat.isActive)
      .sort((a: any, b: any) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
        return a.title.localeCompare(b.title);
      })
      .slice(0, 12);

    const deMainCategories = deCats
      .filter((cat: any) => cat.isActive)
      .sort((a: any, b: any) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
        return a.title.localeCompare(b.title);
      })
      .slice(0, 12);

    console.log('\n' + '='.repeat(60));
    console.log('HOMEPAGE DISPLAY (after filtering & sorting)');
    console.log('='.repeat(60));
    console.log(`Norwegian will show: ${noMainCategories.length} categories`);
    console.log(`German will show: ${deMainCategories.length} categories\n`);

    if (noMainCategories.length !== deMainCategories.length) {
      console.log('⚠️  WARNING: Different number of categories will be displayed!');
    }

    console.log('\n✅ Comparison complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

compareHomepageData();
