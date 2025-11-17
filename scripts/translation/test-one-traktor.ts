import dotenv from 'dotenv';
import { acquireLock, releaseLock } from './process-lock';
import {
  initSanityClient,
  getSanityClient,
  createTranslationDocument,
} from './sanity-client';
import { initOpenAIClient, translateDocument } from './openai-client';

dotenv.config();

async function testOne() {
  console.log('🧪 Testing single Traktor drawing translation\n');

  if (!acquireLock()) {
    console.error('Lock file exists, exiting.');
    process.exit(1);
  }

  try {
    initSanityClient();
    initOpenAIClient();

    const client = getSanityClient();

    // Get the first untranslated Traktor drawing
    const drawing = await client.fetch(`
      *[_type == "drawingImage" && language == "no" && subcategory._ref == "e08064e4-42ef-48bc-a38f-f3a33523aac9"][0]{
        _id,
        _type,
        title,
        description,
        metaDescription,
        contextContent,
        slug,
        subcategory,
        previewImage,
        image,
        pdfFile,
        thumbnail,
        highResImage
      }
    `);

    if (!drawing) {
      console.log('No Traktor drawings found');
      return;
    }

    console.log(`Found drawing: "${drawing.title}"\n`);

    // Translate
    console.log('Translating...');
    const translatedFields = await translateDocument(drawing, 'drawingImage');

    console.log('\nCreating document...');
    const result = await createTranslationDocument(
      drawing,
      translatedFields,
      'sv',
      false
    );

    if (result) {
      console.log(`\n✅ SUCCESS! Created: ${result._id}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    releaseLock();
  }
}

testOne();
