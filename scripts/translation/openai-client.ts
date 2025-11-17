/**
 * OpenAI Client for Translation
 */

import OpenAI from 'openai';
import { TRANSLATION_CONFIG } from './config';
import { getGlossaryPrompt } from './glossary';
import type { DocumentType } from './types';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
export function initOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required.\n' +
      'Get your API key at: https://platform.openai.com/api-keys'
    );
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    return initOpenAIClient();
  }
  return openaiClient;
}

/**
 * Generate system prompt based on document type
 */
function getSystemPrompt(documentType: DocumentType): string {
  const basePrompt = `You are a native-level Swedish transcreator. Translate the Norwegian text into natural, idiomatic Swedish that reads as if it were originally written by a Swedish educator or children's content writer.

This content is for a Norwegian coloring pages website (tegnogfarge.no) that offers free coloring pages for children and adults.

IMPORTANT: Rewrite sentences when needed so the text reads like original Swedish, not a translation.

CRITICAL TERMINOLOGY:
- PRIMARY TERM: Use "målarbilder" (coloring pictures/pages) - this is what Swedish parents search for
- VERB: Use "måla" (to color/paint) not "färglägga" or "teckna"
- AVOID: "teckningar" (drawings) in most contexts - prefer "målarbilder"
- BE CONSISTENT: Don't mix terminology within the same document

Guidelines:
1. Rewrite freely to improve flow — avoid literal translation
2. Use natural Swedish terms: målarbilder (pictures), måla (to color), färgläggning (coloring activity)
3. Keep the tone warm, pedagogical and imaginative
4. Vary sentence structure; avoid repetitive "När du…" patterns
5. Make the text smooth, friendly and child-appropriate
6. Keep SEO keywords natural, not forced
7. Preserve formatting exactly
8. Adapt cultural references (e.g., Norwegian holidays → Swedish equivalents)
9. For image alt texts, be descriptive but concise
10. Maintain consistency with the provided glossary

${getGlossaryPrompt()}`;

  const typeSpecificGuidelines: Record<DocumentType, string> = {
    category: `
This is a category page title and description. Categories are broad topics like "Animals", "Nature", "Holidays".
- Titles should be short and clear (1-3 words)
- Descriptions should be engaging and explain what the category contains
- SEO content should include relevant Swedish search terms that Swedish parents would naturally use`,

    subcategory: `
This is a subcategory page. Subcategories are specific topics within categories (e.g., "Dogs" within "Animals").
- Titles should be specific and descriptive
- Descriptions should explain what types of coloring pages are available
- Write naturally using terms Swedish parents would search for (e.g., "målarbilder med hundar")`,

    drawingImage: `
This is a specific coloring page with title, description, and instructions.
- Titles should be descriptive of what the image shows
- Descriptions can be more detailed and engaging
- Context content may include tips for parents or educational information
- Alt texts should describe the image for screen readers and SEO
- Write as if you're explaining the coloring page to Swedish parents and children`,
  };

  return basePrompt + '\n\n' + typeSpecificGuidelines[documentType];
}

/**
 * Translate and slugify for URL-safe Swedish slug
 */
export async function translateSlug(
  norwegianSlug: string,
  documentType: DocumentType
): Promise<string> {
  if (!norwegianSlug || norwegianSlug.trim().length === 0) {
    return '';
  }

  const client = getOpenAIClient();

  const prompt = `Translate this URL slug from Norwegian to Swedish.

CRITICAL RULES:
1. Translate the words to Swedish (use glossary)
2. Keep it URL-safe: lowercase, hyphens only, no spaces
3. No special characters (å→a, ä→a, ö→o)
4. Keep it SEO-friendly and descriptive
5. Return ONLY the slug, nothing else

Examples:
- "fargelegge-hund" → "mala-hund"
- "fargelegge-jul" → "mala-jul"
- "tegning-av-katt" → "teckning-av-katt"

Norwegian slug: ${norwegianSlug}

Swedish slug:`;

  try {
    const response = await client.chat.completions.create({
      model: TRANSLATION_CONFIG.OPENAI_MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(documentType) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1, // Very low for consistency
      max_tokens: 100, // Slugs are short
    });

    let translation = response.choices[0]?.message?.content?.trim() || '';

    if (!translation) {
      throw new Error('Empty slug translation received from OpenAI');
    }

    // Additional safety: Ensure it's actually URL-safe
    translation = translation
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[æ]/g, 'ae')          // Replace æ with ae (Norwegian)
      .replace(/[ø]/g, 'o')           // Replace ø with o (Norwegian)
      .replace(/[å]/g, 'a')           // Replace å with a (Norwegian)
      .replace(/[ä]/g, 'a')           // Replace ä with a (Swedish)
      .replace(/[ö]/g, 'o')           // Replace ö with o (Swedish)
      .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric except hyphens
      .replace(/-+/g, '-')            // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');         // Remove hyphens from start/end

    console.log(`    Slug: ${norwegianSlug} → ${translation}`);

    return translation;
  } catch (error) {
    console.error(`Error translating slug ${norwegianSlug}:`, error);
    throw error;
  }
}

/**
 * Translate a single text field
 */
export async function translateText(
  text: string,
  documentType: DocumentType,
  fieldName: string
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return '';
  }

  const client = getOpenAIClient();

  const prompt = `Translate this ${fieldName} from Norwegian to Swedish:

Norwegian:
${text}

Swedish translation:`;

  try {
    const response = await client.chat.completions.create({
      model: TRANSLATION_CONFIG.OPENAI_MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(documentType) },
        { role: 'user', content: prompt },
      ],
      temperature: TRANSLATION_CONFIG.OPENAI_TEMPERATURE,
      max_tokens: TRANSLATION_CONFIG.OPENAI_MAX_TOKENS,
    });

    const translation = response.choices[0]?.message?.content?.trim() || '';

    if (!translation) {
      throw new Error('Empty translation received from OpenAI');
    }

    return translation;
  } catch (error) {
    console.error(`Error translating ${fieldName}:`, error);
    throw error;
  }
}

/**
 * Translate portable text (rich text) content
 * OPTIMIZED: Translates entire blocks at once instead of individual spans
 * Preserves structure while translating text nodes efficiently
 */
export async function translatePortableText(
  blocks: any[],
  documentType: DocumentType
): Promise<any[]> {
  if (!blocks || blocks.length === 0) {
    return [];
  }

  const translatedBlocks = [];

  for (const block of blocks) {
    if (block._type === 'block' && block.children) {
      // OPTIMIZED: Extract all text from all spans in this block
      const spanTexts: string[] = [];
      const spanIndices: number[] = [];

      block.children.forEach((child: any, index: number) => {
        if (child._type === 'span' && child.text) {
          spanTexts.push(child.text);
          spanIndices.push(index);
        }
      });

      if (spanTexts.length === 0) {
        // No text to translate
        translatedBlocks.push(block);
        continue;
      }

      // OPTIMIZED: Translate entire block as one API call
      // Join with special delimiter that won't appear in normal text
      const combinedText = spanTexts.join('|||SPAN_DELIMITER|||');
      const translatedCombined = await translateText(
        combinedText,
        documentType,
        'portable text block'
      );

      // Split back into individual spans
      const translatedSpanTexts = translatedCombined.split('|||SPAN_DELIMITER|||');

      // Ensure we got back the same number of spans
      if (translatedSpanTexts.length !== spanTexts.length) {
        console.warn(
          `⚠ Warning: Expected ${spanTexts.length} spans, got ${translatedSpanTexts.length}. ` +
          'Falling back to original text for this block.'
        );
        translatedBlocks.push(block);
        continue;
      }

      // Reconstruct children with translated text
      const translatedChildren = block.children.map((child: any, index: number) => {
        const spanArrayIndex = spanIndices.indexOf(index);
        if (spanArrayIndex !== -1) {
          // This is a text span - use translated text
          return {
            ...child,
            text: translatedSpanTexts[spanArrayIndex].trim(),
          };
        } else {
          // Non-text child (marks, etc.) - keep as-is
          return child;
        }
      });

      translatedBlocks.push({
        ...block,
        children: translatedChildren,
      });
    } else {
      // Keep non-text blocks as-is (images, etc.)
      translatedBlocks.push(block);
    }
  }

  return translatedBlocks;
}

/**
 * Translate all fields for a document
 */
export async function translateDocument(
  document: any,
  documentType: DocumentType
): Promise<Record<string, any>> {
  const translatableFields = TRANSLATION_CONFIG.TRANSLATABLE_FIELDS[documentType];
  const translatedFields: Record<string, any> = {};

  console.log(`  Translating ${documentType} "${document.title}"...`);

  for (const fieldPath of translatableFields) {
    const fieldParts = fieldPath.split('.');
    let value = document;

    // Navigate nested fields (e.g., "image.alt", "slug.current")
    for (const part of fieldParts) {
      value = value?.[part];
    }

    if (!value) {
      continue; // Skip empty fields
    }

    try {
      let translatedValue;

      // Special handling for contextContent (portable text)
      if (fieldPath === 'contextContent' && Array.isArray(value)) {
        translatedValue = await translatePortableText(value, documentType);
      }
      // Special handling for slugs (URL-safe translation)
      else if (fieldPath === 'slug.current' && typeof value === 'string') {
        translatedValue = await translateSlug(value, documentType);
      }
      // Regular text translation
      else if (typeof value === 'string') {
        translatedValue = await translateText(value, documentType, fieldPath);
      }

      // Set translated value in nested structure
      if (fieldParts.length === 1) {
        translatedFields[fieldParts[0]] = translatedValue;
      } else if (fieldParts.length === 2) {
        if (!translatedFields[fieldParts[0]]) {
          translatedFields[fieldParts[0]] = { ...document[fieldParts[0]] };
        }
        translatedFields[fieldParts[0]][fieldParts[1]] = translatedValue;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, TRANSLATION_CONFIG.DELAY_BETWEEN_REQUESTS_MS));

    } catch (error) {
      console.error(`  ✗ Failed to translate ${fieldPath}:`, error);
      // Continue with other fields even if one fails
    }
  }

  console.log(`  ✓ Translated ${Object.keys(translatedFields).length} fields`);

  return translatedFields;
}
