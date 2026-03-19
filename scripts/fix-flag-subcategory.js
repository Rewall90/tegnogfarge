#!/usr/bin/env node

/**
 * Fix Flag Subcategory Translation Issue
 *
 * This script:
 * 1. Creates a proper Swedish subcategory translation with baseDocumentId
 * 2. Updates all 129 Swedish flag drawings to reference the new Swedish subcategory
 */

const sanityClient = require('@sanity/client');
require('dotenv').config();

const client = sanityClient.default({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const NORWEGIAN_SUBCATEGORY_ID = '384b514f-afb7-48fd-b0df-a4bab192065b';

async function fixFlagSubcategory() {
  console.log('=== FIXING FLAG SUBCATEGORY TRANSLATION ===\n');

  // Step 1: Get the Norwegian subcategory data
  console.log('📊 Step 1: Fetching Norwegian subcategory...');
  const norwegianSubcategory = await client.fetch(`
    *[_type == "subcategory" && _id == $id][0] {
      _id,
      _type,
      title,
      slug,
      description,
      seo,
      order,
      isActive,
      category,
      language
    }
  `, { id: NORWEGIAN_SUBCATEGORY_ID });

  if (!norwegianSubcategory) {
    console.error('❌ Norwegian subcategory not found!');
    process.exit(1);
  }

  console.log(`✓ Found: ${norwegianSubcategory.title}\n`);

  // Step 2: Check if Swedish subcategory already exists
  console.log('📊 Step 2: Checking for existing Swedish subcategory...');
  const existingSwedish = await client.fetch(`
    *[_type == "subcategory" && language == "sv" && baseDocumentId == $id]
  `, { id: NORWEGIAN_SUBCATEGORY_ID });

  let swedishSubcategoryId;

  if (existingSwedish.length > 0) {
    console.log(`⚠️  Swedish subcategory already exists: ${existingSwedish[0].title}`);
    console.log(`   ID: ${existingSwedish[0]._id}\n`);
    swedishSubcategoryId = existingSwedish[0]._id;
  } else {
    // Step 3: Create Swedish subcategory
    console.log('📝 Step 3: Creating Swedish subcategory...');

    const swedishSubcategory = {
      _type: 'subcategory',
      language: 'sv',
      baseDocumentId: NORWEGIAN_SUBCATEGORY_ID,
      title: 'Måla Flaggor', // Swedish translation of "Fargelegge Flagg"
      slug: {
        _type: 'slug',
        current: 'mala-flaggor'
      },
      description: `Välkommen till vår samling av flaggritningar att färglägga – lär dig om världens länder genom kreativ färgläggning! Här hittar du flaggor från hela världen: från Europa, Asien, Afrika, Amerika och Oceanien. Utforska flaggorna från Norge, Sverige, USA, Japan, Brasilien och många fler länder.

Varje flaggritning innehåller användbar information om landet – från geografi och huvudstad till kultur, natur och roliga fakta. Filtrera enkelt på kontinent, färger, svårighetsgrad eller sök efter specifika länder för att hitta precis den flagga du vill färglägga.

Alla ritningar har kraftiga, tydliga konturer som gör dem enkla att färglägga, och finns i olika svårighetsgrader – från enkla flaggor med få färger och stora fält, till mer detaljerade designer med komplexa mönster och symboler.

Du kan färglägga direkt i webbläsaren, eller ladda ner bilderna som PDF-filer. Motiven kan skrivas ut i både A4- och A3-format, eller färgläggas digitalt på surfplatta och mobil.

Flaggritningar är perfekta för att kombinera kreativitet med lärande – barn och vuxna kan utforska världens länder, kulturer och geografi medan de färglägger flaggorna!`,
      seo: {
        title: 'Flaggor att färglägga – 210+ Flaggor!',
        description: 'Färglägg alla världens flaggor från Europa, Asien, Afrika och Amerika. Filtrera på huvudstäder, kontinent och mycket mer. Gratis nedladdning!'
      },
      order: norwegianSubcategory.order,
      isActive: norwegianSubcategory.isActive,
      category: norwegianSubcategory.category, // Same category reference
    };

    const result = await client.create(swedishSubcategory);
    swedishSubcategoryId = result._id;
    console.log(`✓ Created Swedish subcategory: ${result.title}`);
    console.log(`   ID: ${swedishSubcategoryId}\n`);
  }

  // Step 4: Get all Swedish flag drawings that reference the Norwegian subcategory
  console.log('📊 Step 4: Fetching Swedish drawings with wrong subcategory...');
  const swedishDrawings = await client.fetch(`
    *[_type == "drawingImage" && language == "sv" && subcategory._ref == $norwegianId] {
      _id,
      title
    }
  `, { norwegianId: NORWEGIAN_SUBCATEGORY_ID });

  console.log(`✓ Found ${swedishDrawings.length} Swedish drawings to fix\n`);

  if (swedishDrawings.length === 0) {
    console.log('✅ No drawings to fix!\n');
    return;
  }

  // Step 5: Update all Swedish drawings to reference the Swedish subcategory
  console.log('🔧 Step 5: Updating Swedish drawings...');
  console.log('   This may take a moment...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < swedishDrawings.length; i++) {
    const drawing = swedishDrawings[i];

    try {
      await client
        .patch(drawing._id)
        .set({
          subcategory: {
            _type: 'reference',
            _ref: swedishSubcategoryId
          }
        })
        .commit();

      successCount++;

      // Show progress every 10 drawings
      if ((i + 1) % 10 === 0 || i === swedishDrawings.length - 1) {
        console.log(`   ✓ Updated ${i + 1}/${swedishDrawings.length} drawings`);
      }
    } catch (error) {
      console.error(`   ✗ Failed to update ${drawing.title}: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n=== SUMMARY ===\n');
  console.log(`✓ Successfully updated: ${successCount} drawings`);
  if (failCount > 0) {
    console.log(`✗ Failed: ${failCount} drawings`);
  }
  console.log(`\n✅ All Swedish flag drawings now reference the Swedish subcategory!\n`);
  console.log(`Next step: Run translation script to translate remaining 85 drawings`);
  console.log(`   npm run translate:by-subcategory -- --subcategory="Måla Flaggor"\n`);
}

fixFlagSubcategory().catch(error => {
  console.error('\n✗ Error:', error);
  process.exit(1);
});
