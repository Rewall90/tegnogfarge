#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { getAllCategories } from './src/lib/sanity';

dotenv.config();

async function checkImages() {
  const [noCats, deCats] = await Promise.all([
    getAllCategories('no'),
    getAllCategories('de')
  ]);

  console.log('Norwegian categories with images:');
  noCats.forEach((cat: any) => {
    console.log(`  - ${cat.title}: ${cat.image?.url ? '✓ Has image' : '✗ NO IMAGE'}`);
  });

  console.log('\nGerman categories with images:');
  deCats.forEach((cat: any) => {
    console.log(`  - ${cat.title}: ${cat.image?.url ? '✓ Has image' : '✗ NO IMAGE'}`);
  });

  const noMissingImages = noCats.filter((c: any) => !c.image?.url).length;
  const deMissingImages = deCats.filter((c: any) => !c.image?.url).length;

  console.log(`\nNorwegian missing images: ${noMissingImages}`);
  console.log(`German missing images: ${deMissingImages}`);
}

checkImages();
