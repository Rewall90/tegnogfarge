#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { initSanityClient } from './sanity-client';

dotenv.config();

const subcategoryId = process.argv[2];
const subcategoryName = process.argv[3];

async function qaSubcategory() {
  const client = initSanityClient();

  const norwegianCount = await client.fetch(
    `count(*[_type == "drawingImage" && language == "no" && subcategory._ref == $id])`,
    { id: subcategoryId }
  );

  const swedishDrawings = await client.fetch(
    `*[_type == "drawingImage" && language == "sv" && baseDocumentId in *[_type == "drawingImage" && language == "no" && subcategory._ref == $id]._id] {
      _id,
      "hasDisplay": defined(displayImage.asset._ref),
      "hasThumbnail": defined(thumbnailImage.asset._ref),
      "hasWebp": defined(webpImage.asset._ref),
      "hasDifficulty": defined(difficulty),
      "hasAge": defined(recommendedAgeRange)
    }`,
    { id: subcategoryId }
  );

  const complete = swedishDrawings.filter((d: any) =>
    d.hasDisplay && d.hasThumbnail && d.hasWebp && d.hasDifficulty && d.hasAge
  ).length;

  console.log(`\n✅ QA Check: ${subcategoryName}\n`);
  console.log(`   Norwegian drawings: ${norwegianCount}`);
  console.log(`   Swedish drawings: ${swedishDrawings.length}`);
  console.log(`   Complete (all fields): ${complete}`);
  console.log(`   Missing fields: ${swedishDrawings.length - complete}`);
  console.log(`   Not translated: ${norwegianCount - swedishDrawings.length}\n`);

  if (norwegianCount === swedishDrawings.length && complete === swedishDrawings.length) {
    console.log('   🎉 PERFECT! All drawings translated with all fields!\n');
  } else if (swedishDrawings.length - complete > 0) {
    console.log(`   ⚠️  ${swedishDrawings.length - complete} drawings missing some fields\n`);
  } else if (norwegianCount > swedishDrawings.length) {
    console.log(`   ⚠️  ${norwegianCount - swedishDrawings.length} drawings not yet translated\n`);
  }
}

qaSubcategory();
