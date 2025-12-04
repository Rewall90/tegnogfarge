import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Coloring page prompt - based on Google's official Gemini prompting best practices
// Key principles: Describe narratively, be specific about style, specify what you want
const COLORING_PAGE_PROMPT = `Create a black and white coloring book page based on this photo.

Transform the entire image into a clean line art drawing. Trace all visible elements exactly as they appear - every detail of the person including their complete silhouette, head, body, clothing, and all surroundings.

Style requirements:
- Black outlines on pure white background only
- No colors, no shading, no gradients, no filled areas
- Bold clean lines suitable for coloring
- Preserve the complete likeness of the subject - their full appearance exactly as shown
- Include all details visible in the original photo

Output: A printable coloring page with only black lines (#000000) on white (#FFFFFF). No other colors allowed.`;

// ============================================================================
// TYPES
// ============================================================================

interface PhotoToColoringRequest {
  image: string; // Base64 encoded image data
  mimeType: string; // e.g., 'image/jpeg', 'image/png'
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error('[photo-to-coloring] Missing GEMINI_API_KEY');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: PhotoToColoringRequest = await request.json();

    if (!body.image || !body.mimeType) {
      return NextResponse.json(
        { error: 'Missing image or mimeType' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(body.mimeType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Use JPEG, PNG, or WebP.' },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Use Gemini 2.5 Flash Image for image generation
    // This is the working model from the coloringvault project
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        // @ts-expect-error - responseModalities is valid but not in types yet
        responseModalities: ['Text', 'Image'],
      },
    });

    console.log('[photo-to-coloring] Processing image...');

    // Generate coloring page
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: body.mimeType,
          data: body.image,
        },
      },
      { text: COLORING_PAGE_PROMPT },
    ]);

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      console.error('[photo-to-coloring] No candidates in response');
      return NextResponse.json(
        { error: 'Failed to generate coloring page' },
        { status: 500 }
      );
    }

    // Extract the generated image
    const parts = candidates[0].content?.parts;
    let generatedImage: { data: string; mimeType: string } | null = null;
    let responseText = '';

    if (parts) {
      for (const part of parts) {
        if ('text' in part && part.text) {
          responseText = part.text;
        }
        if ('inlineData' in part && part.inlineData) {
          generatedImage = {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png',
          };
        }
      }
    }

    if (!generatedImage) {
      console.error('[photo-to-coloring] No image in response. Text:', responseText);
      return NextResponse.json(
        { error: 'No coloring page generated. Please try a different image.' },
        { status: 500 }
      );
    }

    console.log('[photo-to-coloring] Successfully generated coloring page');

    // Return the generated image
    return NextResponse.json({
      success: true,
      image: {
        data: generatedImage.data,
        mimeType: generatedImage.mimeType,
      },
      message: responseText || 'Coloring page generated successfully',
    });

  } catch (error) {
    console.error('[photo-to-coloring] Error:', error);

    // Handle specific Gemini errors
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        return NextResponse.json(
          { error: 'Image could not be processed due to content restrictions.' },
          { status: 400 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return NextResponse.json(
          { error: 'Service is busy. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    );
  }
}

// ============================================================================
// ROUTE SEGMENT CONFIG
// ============================================================================

// Maximum duration for this route (in seconds) - needed for AI processing
export const maxDuration = 60;

// Note: Body size limits in App Router are configured differently.
// For large file uploads, consider using streaming or multipart form data.
// The default limit is 4MB which should be sufficient for most images.
