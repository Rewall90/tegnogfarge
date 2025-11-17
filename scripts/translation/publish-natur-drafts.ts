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

async function publishDrafts() {
  const draftIds = [
    'drafts.drawingImage-grisen-kjorer-traktor-pa-garden-1751791941',
    'drafts.drawingImage-trikk-kjorer-under-regnbuen-1760509227',
    'drafts.drawingImage-glad-skjell-med-krone-1751886309'
  ];

  console.log(`\n📝 Publishing ${draftIds.length} draft drawings...\n`);

  for (const draftId of draftIds) {
    const publishedId = draftId.replace('drafts.', '');

    console.log(`🔄 Publishing: ${draftId}`);

    try {
      // Get the draft document
      const draft = await client.fetch(`*[_id == $draftId][0]`, { draftId });

      if (!draft) {
        console.log(`   ❌ Draft not found`);
        continue;
      }

      console.log(`   Title: "${draft.title}"`);

      // Create/update the published version
      const publishedDoc = {
        ...draft,
        _id: publishedId,
        _type: draft._type
      };

      // Remove draft-specific fields
      delete publishedDoc._createdAt;
      delete publishedDoc._updatedAt;
      delete publishedDoc._rev;

      await client.createOrReplace(publishedDoc);

      console.log(`   ✅ Published to: ${publishedId}`);

      // Optionally delete the draft
      // await client.delete(draftId);
      // console.log(`   🗑️  Deleted draft`);

    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }

    console.log('');
  }

  console.log('✅ Publishing complete!\n');
}

publishDrafts().catch(console.error);
