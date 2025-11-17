#!/usr/bin/env ts-node

/**
 * Translate One Traktor Drawing
 * For testing and debugging the translation process
 */

import * as dotenv from 'dotenv';
import { initSanityClient, createTranslationDocument } from './sanity-client';
import { initOpenAIClient, translateDocument } from './openai-client';

dotenv.config();

async function translateOneTraktor() {
  console.log('🚜 Translating one traktor drawing...\n');

  // Initialize clients
  const sanityClient = initSanityClient();
  initOpenAIClient();

  // Find traktor subcategory
  const traktorSubcategory = await sanityClient.fetch(
    `*[_type == "subcategory" && slug.current match "traktor*" && language == "no"][0] {
      _id,
      title,
      slug
    }`
  );

  if (!traktorSubcategory) {
    console.error('❌ Could not find traktor subcategory');
    process.exit(1);
  }

  console.log(`Found traktor subcategory: ${traktorSubcategory.title} (${traktorSubcategory._id})\n`);

  // Find one Norwegian drawing in traktor category that hasn't been translated yet
  const norwegianDrawing = await sanityClient.fetch(
    `*[
      _type == "drawingImage" &&
      language == "no" &&
      subcategory._ref == $subcategoryId &&
      !(_id in *[_type == "drawingImage" && language == "sv"].baseDocumentId)
    ] | order(_createdAt asc) [0] {
      _id,
      _type,
      _createdAt,
      title,
      slug,
      description,
      metaDescription,
      contextContent,
      displayImage,
      thumbnailImage,
      webpImage,
      instagramImage,
      pinterestImage,
      downloadFile,
      subcategory,
      recommendedAgeRange,
      difficulty,
      order,
      publishedDate,
      hasDigitalColoring,
      isActive,
      tags,
      entity,
      seo,
      language,
      isPublishedToPinterest,
      isPublishedToInstagram,
      isPublishedToFacebook
    }`,
    { subcategoryId: traktorSubcategory._id }
  );

  if (!norwegianDrawing) {
    console.log('✅ All traktor drawings are already translated!');
    process.exit(0);
  }

  console.log('📄 Norwegian Drawing:');
  console.log(`  Title: ${norwegianDrawing.title}`);
  console.log(`  ID: ${norwegianDrawing._id}`);
  console.log(`  Slug: ${norwegianDrawing.slug?.current}`);
  console.log('\n📋 Fields present in Norwegian document:');
  for (const [key, value] of Object.entries(norwegianDrawing)) {
    if (key.startsWith('_')) continue;
    const hasValue = value !== null && value !== undefined;
    console.log(`  ${hasValue ? '✓' : '✗'} ${key}: ${hasValue ? '(present)' : '(empty)'}`);
  }

  console.log('\n🖼️ Image fields in Norwegian document:');
  console.log(`  displayImage: ${norwegianDrawing.displayImage ? JSON.stringify(norwegianDrawing.displayImage, null, 4) : 'MISSING'}`);
  console.log(`  thumbnailImage: ${norwegianDrawing.thumbnailImage ? JSON.stringify(norwegianDrawing.thumbnailImage, null, 4) : 'MISSING'}`);
  console.log(`  webpImage: ${norwegianDrawing.webpImage ? JSON.stringify(norwegianDrawing.webpImage, null, 4) : 'MISSING'}`);

  // Translate the document
  console.log('\n🔄 Translating...\n');
  const translatedFields = await translateDocument(norwegianDrawing, 'drawingImage');

  console.log('\n📝 Translated fields returned from OpenAI:');
  console.log(JSON.stringify(translatedFields, null, 2));

  // Create the Swedish document
  console.log('\n✨ Creating Swedish document...\n');
  const result = await createTranslationDocument(
    norwegianDrawing,
    translatedFields,
    'sv',
    false // Not a dry run
  );

  if (result) {
    console.log(`\n✅ Success! Swedish document created: ${result._id}\n`);

    // Fetch and display the created Swedish document
    const swedishDrawing = await sanityClient.fetch(
      `*[_id == $id][0] {
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
        language,
        baseDocumentId
      }`,
      { id: result._id }
    );

    console.log('🇸🇪 Created Swedish Document:');
    console.log(`  Title: ${swedishDrawing.title}`);
    console.log(`  Slug: ${swedishDrawing.slug?.current}`);
    console.log(`  Language: ${swedishDrawing.language}`);
    console.log(`  Base Document ID: ${swedishDrawing.baseDocumentId}`);
    console.log('\n📋 Fields in Swedish document:');
    for (const [key, value] of Object.entries(swedishDrawing)) {
      if (key.startsWith('_')) continue;
      const hasValue = value !== null && value !== undefined;
      console.log(`  ${hasValue ? '✓' : '✗'} ${key}: ${hasValue ? '(present)' : '(empty)'}`);
    }

    console.log('\n🖼️ Image fields in Swedish document:');
    console.log(`  displayImage: ${swedishDrawing.displayImage ? JSON.stringify(swedishDrawing.displayImage, null, 4) : 'MISSING'}`);
    console.log(`  thumbnailImage: ${swedishDrawing.thumbnailImage ? JSON.stringify(swedishDrawing.thumbnailImage, null, 4) : 'MISSING'}`);
    console.log(`  webpImage: ${swedishDrawing.webpImage ? JSON.stringify(swedishDrawing.webpImage, null, 4) : 'MISSING'}`);

    // Compare
    console.log('\n🔍 Comparison:');
    const norwegianHasDisplayImage = !!norwegianDrawing.displayImage?.asset;
    const swedishHasDisplayImage = !!swedishDrawing.displayImage?.asset;
    console.log(`  displayImage: Norwegian ${norwegianHasDisplayImage ? '✓' : '✗'} → Swedish ${swedishHasDisplayImage ? '✓' : '✗'}`);

    const norwegianHasThumbnail = !!norwegianDrawing.thumbnailImage?.asset;
    const swedishHasThumbnail = !!swedishDrawing.thumbnailImage?.asset;
    console.log(`  thumbnailImage: Norwegian ${norwegianHasThumbnail ? '✓' : '✗'} → Swedish ${swedishHasThumbnail ? '✓' : '✗'}`);

    const norwegianHasWebp = !!norwegianDrawing.webpImage?.asset;
    const swedishHasWebp = !!swedishDrawing.webpImage?.asset;
    console.log(`  webpImage: Norwegian ${norwegianHasWebp ? '✓' : '✗'} → Swedish ${swedishHasWebp ? '✓' : '✗'}`);

    if (!swedishHasDisplayImage && norwegianHasDisplayImage) {
      console.log('\n⚠️  WARNING: Image assets were NOT copied!');
    } else if (swedishHasDisplayImage && norwegianHasDisplayImage) {
      console.log('\n✅ SUCCESS: Image assets were copied correctly!');
    }
  }

  console.log('\n✅ Translation test complete!\n');
}

translateOneTraktor().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
