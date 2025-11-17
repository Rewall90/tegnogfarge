#!/usr/bin/env ts-node

import { createSanityClient } from './sanity-client';
import { createOpenAIClient } from './openai-client';
import { translateDrawing } from './translate';
import * as dotenv from 'dotenv';

dotenv.config();

async function translateSpecificDrawings() {
  const sanityClient = createSanityClient();
  const openaiClient = createOpenAIClient();

  // Published IDs (without drafts. prefix) - Remaining 14 Svampebob drawings
  const drawingIds = [
    'drawingImage-boble-bass-str-med-armene-i-siden-1750767385',
    'drawingImage-den-skumle-spkelessjefen-1750767418',
    'drawingImage-frken-puff-og-regnbuene-frken-puff-leker-ute-frken-puff-smiler-stort-frken-puff-i-par-1750767369',
    'drawingImage-herr-krabbe-bader-i-penger-1750767522',
    'drawingImage-larry-hummeren-er-sterk-1750767402',
    'drawingImage-mannebob-redder-dagen-som-helt-1750767434',
    'drawingImage-patrick-stjerne-sklir-p-isen-1750767498',
    'drawingImage-reke-gutten-er-superhelt-i-dag-1750767449',
    'drawingImage-sandy-lager-sin-egen-rakett-1750767509',
    'drawingImage-svampebob-lager-burger-p-kjkkenet-1750767486',
    'drawingImage-svampebob-mter-burgerroboten-1750767533',
    'drawingImage-svampebob-sammen-med-mamma-og-pappa-1750767350',
    'drawingImage-svampebob-slapper-av-i-sola-1750767461',
    'drawingImage-tom-smiler-i-butikken-1750767474'
  ];

  console.log(`\n🌐 Translating ${drawingIds.length} specific drawings\n`);
  console.log('='.repeat(70));

  let successCount = 0;
  let failCount = 0;

  for (const drawingId of drawingIds) {
    console.log(`\n🔄 Processing: ${drawingId}`);

    try {
      // Get the published drawing
      const drawing = await sanityClient.fetch(`
        *[_id == $drawingId][0]{
          _id,
          _type,
          title,
          slug,
          description,
          metaDescription,
          drawingImageUrl,
          drawingPdfUrl,
          drawingThumbnailUrl,
          socialMediaImageUrl,
          subcategory,
          coloredReferenceImageUrl,
          printableImageUrl,
          isActive,
          language
        }
      `, { drawingId });

      if (!drawing) {
        console.log(`   ❌ Drawing not found (ID: ${drawingId})`);
        failCount++;
        continue;
      }

      console.log(`   Title: "${drawing.title}"`);

      // Check if Swedish translation already exists
      const existingTranslation = await sanityClient.fetch(`
        *[_type == "drawingImage" && language == "sv" && baseDocumentId == $drawingId][0]{
          _id
        }
      `, { drawingId });

      if (existingTranslation) {
        console.log(`   ⊘ Translation already exists, skipping`);
        successCount++;
        continue;
      }

      // Translate the drawing
      await translateDrawing(sanityClient, openaiClient, drawing, 'no', 'sv');

      console.log(`   ✅ Successfully translated`);
      successCount++;

      // Wait 2 seconds between translations
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`   ❌ Error translating:`, error);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Translation Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📈 Total: ${successCount + failCount}`);
  console.log('');
}

translateSpecificDrawings().catch(console.error);
