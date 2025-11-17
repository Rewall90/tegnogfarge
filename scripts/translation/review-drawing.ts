/**
 * Review a Swedish drawing image translation
 */

import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function reviewDrawing() {
  const client = getSanityClient();

  const drawingId = 'JLXnJ6iM2xnWCFLJqjS8Dy'; // Utomjording tittar på stjärnor

  console.log('🔍 Reviewing Swedish drawing translation...\n');

  // Get the Swedish drawing
  const swedishDoc = await client.fetch(`
    *[_id == $id][0]{
      _id,
      title,
      description,
      metaDescription,
      contextContent,
      "slug": slug.current,
      baseDocumentId,
      subcategory->{
        _id,
        title,
        language
      }
    }
  `, { id: drawingId });

  // Get the Norwegian original
  const norwegianDoc = await client.fetch(`
    *[_id == $id][0]{
      _id,
      title,
      description,
      metaDescription,
      contextContent,
      "slug": slug.current,
      subcategory->{
        _id,
        title,
        language
      }
    }
  `, { id: swedishDoc.baseDocumentId });

  console.log('📄 NORWEGIAN ORIGINAL:\n');
  console.log(`Title: "${norwegianDoc.title}"`);
  console.log(`Slug: ${norwegianDoc.slug}`);
  console.log(`Subcategory: ${norwegianDoc.subcategory?.title} (${norwegianDoc.subcategory?.language})`);
  console.log(`\nDescription:\n${norwegianDoc.description}\n`);
  console.log(`Meta Description:\n${norwegianDoc.metaDescription}\n`);

  console.log('\n' + '='.repeat(70) + '\n');

  console.log('📄 SWEDISH TRANSLATION:\n');
  console.log(`Title: "${swedishDoc.title}"`);
  console.log(`Slug: ${swedishDoc.slug}`);
  console.log(`Subcategory: ${swedishDoc.subcategory?.title} (${swedishDoc.subcategory?.language})`);
  console.log(`\nDescription:\n${swedishDoc.description}\n`);
  console.log(`Meta Description:\n${swedishDoc.metaDescription}\n`);

  console.log('\n' + '='.repeat(70) + '\n');

  console.log('💡 QUALITY CHECK:\n');

  // Check for glossary issues
  const issues = [];

  if (swedishDoc.metaDescription && swedishDoc.metaDescription.includes('färglägg')) {
    issues.push('❌ Uses "färglägg" instead of "måla" in metaDescription');
  }
  if (swedishDoc.description && swedishDoc.description.includes('färglägg')) {
    issues.push('❌ Uses "färglägg" instead of "måla" in description');
  }
  if (swedishDoc.metaDescription && swedishDoc.metaDescription.includes('teckn')) {
    issues.push('❌ Uses "teckn" instead of "målarbilder" in metaDescription');
  }

  // Check if uses natural Swedish
  if (swedishDoc.metaDescription && swedishDoc.metaDescription.includes('målarbilder')) {
    issues.push('✅ Uses natural Swedish term "målarbilder"');
  }
  if (swedishDoc.description && swedishDoc.description.includes('måla')) {
    issues.push('✅ Uses natural Swedish verb "måla"');
  }

  if (issues.length > 0) {
    issues.forEach(issue => console.log(`  ${issue}`));
  } else {
    console.log('  ✅ No obvious issues found');
  }

  console.log('\n');
}

reviewDrawing();
