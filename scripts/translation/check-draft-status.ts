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

async function checkDraftStatus() {
  const ids = [
    'grisen-kjorer-traktor-pa-garden-1751791941',
    'trikk-kjorer-under-regnbuen-1760509227',
    'glad-skjell-med-krone-1751886309'
  ];

  for (const id of ids) {
    const draftId = `drafts.drawingImage-${id}`;
    const publishedId = `drawingImage-${id}`;

    console.log(`\n🔍 Checking: ${id}`);
    console.log('='.repeat(80));

    // Check draft
    const draft = await client.fetch(`*[_id == $id][0]{_id, title, isActive}`, { id: draftId });
    console.log(`Draft (${draftId}):`);
    if (draft) {
      console.log(`  ✓ EXISTS - Title: "${draft.title}", isActive: ${draft.isActive}`);
    } else {
      console.log(`  ✗ NOT FOUND`);
    }

    // Check published
    const published = await client.fetch(`*[_id == $id][0]{_id, title, isActive}`, { id: publishedId });
    console.log(`Published (${publishedId}):`);
    if (published) {
      console.log(`  ✓ EXISTS - Title: "${published.title}", isActive: ${published.isActive}`);
    } else {
      console.log(`  ✗ NOT FOUND`);
    }

    // Check Swedish translation
    const svTranslation = await client.fetch(`
      *[_type == "drawingImage" && language == "sv" && (baseDocumentId == $draftId || baseDocumentId == $publishedId)][0]{
        _id,
        baseDocumentId
      }
    `, { draftId, publishedId });

    console.log(`Swedish translation:`);
    if (svTranslation) {
      console.log(`  ✓ EXISTS - ID: ${svTranslation._id}, baseDocumentId: ${svTranslation.baseDocumentId}`);
    } else {
      console.log(`  ✗ NOT FOUND`);
    }
  }
}

checkDraftStatus().catch(console.error);
