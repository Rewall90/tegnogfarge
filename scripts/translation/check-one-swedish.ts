#!/usr/bin/env ts-node

/**
 * Check one Swedish drawing to see if images are present
 */

import * as dotenv from 'dotenv';
import { initSanityClient } from './sanity-client';

dotenv.config();

async function checkSwedishDrawing() {
  const client = initSanityClient();

  // Check the drawing that was just created: aYFTcuWrW7JG6z44jnngQs
  const drawing = await client.fetch(
    `*[_id == "aYFTcuWrW7JG6z44jnngQs"][0] {
      _id,
      title,
      "slug": slug.current,
      language,
      baseDocumentId,
      displayImage,
      thumbnailImage,
      webpImage,
      downloadFile,
      recommendedAgeRange,
      difficulty,
      hasDigitalColoring,
      subcategory
    }`
  );

  if (!drawing) {
    console.log('❌ Drawing not found');
    return;
  }

  console.log('\n🇸🇪 Swedish Drawing Check\n');
  console.log(`Title: ${drawing.title}`);
  console.log(`ID: ${drawing._id}`);
  console.log(`Slug: ${drawing.slug}`);
  console.log(`Language: ${drawing.language}`);
  console.log(`Base Document ID: ${drawing.baseDocumentId}`);

  console.log('\n📋 Field Status:');
  console.log(`  recommendedAgeRange: ${drawing.recommendedAgeRange || '❌ MISSING'}`);
  console.log(`  difficulty: ${drawing.difficulty || '❌ MISSING'}`);
  console.log(`  hasDigitalColoring: ${drawing.hasDigitalColoring !== undefined ? drawing.hasDigitalColoring : '❌ MISSING'}`);
  console.log(`  subcategory: ${drawing.subcategory?._ref ? `✅ ${drawing.subcategory._ref}` : '❌ MISSING'}`);

  console.log('\n🖼️  Image Fields:');
  console.log(`  displayImage:`);
  if (drawing.displayImage?.asset?._ref) {
    console.log(`    ✅ Asset: ${drawing.displayImage.asset._ref}`);
    console.log(`    Alt: ${drawing.displayImage.alt || '(no alt text)'}`);
  } else {
    console.log(`    ❌ MISSING`);
  }

  console.log(`  thumbnailImage:`);
  if (drawing.thumbnailImage?.asset?._ref) {
    console.log(`    ✅ Asset: ${drawing.thumbnailImage.asset._ref}`);
    console.log(`    Alt: ${drawing.thumbnailImage.alt || '(no alt text)'}`);
  } else {
    console.log(`    ❌ MISSING`);
  }

  console.log(`  webpImage:`);
  if (drawing.webpImage?.asset?._ref) {
    console.log(`    ✅ Asset: ${drawing.webpImage.asset._ref}`);
    console.log(`    Alt: ${drawing.webpImage.alt || '(no alt text)'}`);
  } else {
    console.log(`    ❌ MISSING`);
  }

  console.log(`  downloadFile:`);
  if (drawing.downloadFile?.asset?._ref) {
    console.log(`    ✅ Asset: ${drawing.downloadFile.asset._ref}`);
  } else {
    console.log(`    ❌ MISSING`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Summary
  const hasDisplayImage = !!drawing.displayImage?.asset?._ref;
  const hasThumbnail = !!drawing.thumbnailImage?.asset?._ref;
  const hasWebp = !!drawing.webpImage?.asset?._ref;
  const hasAllImages = hasDisplayImage && hasThumbnail && hasWebp;

  if (hasAllImages) {
    console.log('✅ SUCCESS! All image fields are present!\n');
  } else {
    console.log('❌ PROBLEM: Some image fields are missing!\n');
  }
}

checkSwedishDrawing().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
