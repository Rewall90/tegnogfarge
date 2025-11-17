#!/usr/bin/env ts-node

/**
 * Diagnostic Script: Inspect Swedish Drawing
 * Checks what fields are actually present in a translated drawing
 */

import * as dotenv from 'dotenv';
import { initSanityClient } from './sanity-client';

dotenv.config();

async function inspectSwedishDrawing() {
  const client = initSanityClient();

  // Get the first Swedish drawing
  const drawings = await client.fetch(
    `*[_type == "drawingImage" && language == "sv"] | order(_createdAt desc) [0...5] {
      _id,
      title,
      slug,
      description,
      displayImage,
      thumbnailImage,
      webpImage,
      recommendedAgeRange,
      difficulty,
      hasDigitalColoring,
      subcategory,
      baseDocumentId
    }`
  );

  console.log('\n📊 Swedish Drawing Image Inspection\n');
  console.log(`Found ${drawings.length} Swedish drawings\n`);

  for (const drawing of drawings) {
    console.log('='.repeat(60));
    console.log(`\nDrawing: ${drawing.title}`);
    console.log(`ID: ${drawing._id}`);
    console.log(`Base Document ID: ${drawing.baseDocumentId}`);
    console.log('\nField Analysis:');

    // Check each field
    console.log(`  ✓ title: ${drawing.title ? 'Present' : 'MISSING'}`);
    console.log(`  ✓ slug: ${drawing.slug?.current ? drawing.slug.current : 'MISSING'}`);
    console.log(`  ✓ description: ${drawing.description ? 'Present' : 'MISSING'}`);
    console.log(`  ✓ recommendedAgeRange: ${drawing.recommendedAgeRange || 'MISSING'}`);
    console.log(`  ✓ difficulty: ${drawing.difficulty || 'MISSING'}`);
    console.log(`  ✓ hasDigitalColoring: ${drawing.hasDigitalColoring !== undefined ? drawing.hasDigitalColoring : 'MISSING'}`);
    console.log(`  ✓ subcategory: ${drawing.subcategory?._ref ? `Reference to ${drawing.subcategory._ref}` : 'MISSING'}`);

    // Check image fields
    console.log('\nImage Fields:');
    console.log(`  displayImage: ${drawing.displayImage ? JSON.stringify(drawing.displayImage, null, 4) : 'MISSING'}`);
    console.log(`  thumbnailImage: ${drawing.thumbnailImage ? JSON.stringify(drawing.thumbnailImage, null, 4) : 'MISSING'}`);
    console.log(`  webpImage: ${drawing.webpImage ? JSON.stringify(drawing.webpImage, null, 4) : 'MISSING'}`);

    // Get the Norwegian original for comparison
    if (drawing.baseDocumentId) {
      const norwegian = await client.fetch(
        `*[_id == $id][0] {
          displayImage,
          thumbnailImage,
          webpImage,
          recommendedAgeRange,
          difficulty,
          hasDigitalColoring
        }`,
        { id: drawing.baseDocumentId }
      );

      console.log('\nNorwegian Original:');
      console.log(`  displayImage: ${norwegian.displayImage ? 'Present' : 'MISSING'}`);
      console.log(`  thumbnailImage: ${norwegian.thumbnailImage ? 'Present' : 'MISSING'}`);
      console.log(`  webpImage: ${norwegian.webpImage ? 'Present' : 'MISSING'}`);
      console.log(`  recommendedAgeRange: ${norwegian.recommendedAgeRange || 'MISSING'}`);
      console.log(`  difficulty: ${norwegian.difficulty || 'MISSING'}`);
      console.log(`  hasDigitalColoring: ${norwegian.hasDigitalColoring !== undefined ? norwegian.hasDigitalColoring : 'MISSING'}`);
    }

    console.log('\n');
  }
}

inspectSwedishDrawing().then(() => {
  console.log('✅ Inspection complete\n');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
