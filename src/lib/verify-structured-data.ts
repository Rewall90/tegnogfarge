/**
 * Verification script for JSON-LD structured data
 * Run with: ts-node src/lib/verify-structured-data.ts
 */

import { STRUCTURED_DATA } from './structured-data-constants';
import { createImageObject } from './json-ld-utils';

// Test data for verification
const TEST_DRAWING = {
  _id: 'drawing123',
  slug: 'test-drawing',
  title: 'Test Drawing',
  description: 'A test drawing for verification',
      imageUrl: 'https://tegnogfarge.no/images/test-drawing.jpg',
  image: {
          url: 'https://tegnogfarge.no/images/test-drawing.jpg',
    alt: 'Test Drawing Alt Text',
    metadata: {
      dimensions: {
        width: 800,
        height: 600
      }
    }
  },
  publishedDate: '2023-01-01T12:00:00Z',
  tags: ['test', 'verification', 'drawing']
};

/**
 * Verify image object creation with all required properties
 */
function verifyImageObject() {
  console.log('Testing image object creation...');
  
  const imageObject = createImageObject(
    TEST_DRAWING.image.url,
    TEST_DRAWING.image.alt,
    TEST_DRAWING.image.metadata.dimensions,
    `${TEST_DRAWING.title} fargeleggingsark`
  );
  
  if (!imageObject) {
    console.error('❌ Image object creation failed');
    return null;
  }
  
  // Verify all required properties are present
  const requiredProperties = [
    '@type', 'url', 'contentUrl', 'width', 'height', 'caption', 
    'name', 'license', 'creator', 'creditText', 'copyrightNotice', 'encodingFormat'
  ];
  
  const missingProperties = requiredProperties.filter(prop => 
    !Object.prototype.hasOwnProperty.call(imageObject, prop)
  );
  
  if (missingProperties.length === 0) {
    console.log('✅ Image object contains all required properties');
  } else {
    console.error('❌ Image object is missing properties:', missingProperties);
  }
  
  // Verify author information is correctly included
  if (imageObject.creator &&
      imageObject.creator['@type'] === 'Person' &&
      imageObject.creator.name === STRUCTURED_DATA.AUTHOR.NAME &&
      imageObject.creator.url === STRUCTURED_DATA.AUTHOR.URL) {
    console.log('✅ Creator information is correctly included');
  } else {
    console.error('❌ Creator information is incorrect');
  }
  
  // Verify credit text
  if (imageObject.creditText === STRUCTURED_DATA.AUTHOR.NAME) {
    console.log('✅ Credit text is correctly included');
  } else {
    console.error('❌ Credit text is incorrect');
  }
  
  // Verify license URL is correctly included
  if (imageObject.license === STRUCTURED_DATA.LEGAL.LICENSE_URL) {
    console.log('✅ License URL is correctly included');
  } else {
    console.error('❌ License URL is incorrect');
  }
  
  console.log('Image object test complete');
  console.log('------------------------');
  
  return imageObject;
}

/**
 * Verify a basic drawing JSON-LD structure
 */
function verifyDrawingJsonLd() {
  console.log('Testing drawing JSON-LD structure...');
  
  const imageObject = createImageObject(
    TEST_DRAWING.image.url,
    TEST_DRAWING.image.alt,
    TEST_DRAWING.image.metadata.dimensions,
    `${TEST_DRAWING.title} fargeleggingsark`
  );
  
  // Create a sample drawing JSON-LD
  const drawingJsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": `${STRUCTURED_DATA.ORGANIZATION.URL}/coloring/${TEST_DRAWING._id}`,
    "name": TEST_DRAWING.title,
    "headline": TEST_DRAWING.title,
    "description": TEST_DRAWING.description,
    "url": `${STRUCTURED_DATA.ORGANIZATION.URL}/coloring/${TEST_DRAWING._id}`,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    "datePublished": TEST_DRAWING.publishedDate,
    "dateModified": TEST_DRAWING.publishedDate,
    "image": imageObject,
    "thumbnailUrl": TEST_DRAWING.image.url,
    "artform": "Coloring Page",
    "artworkSurface": "paper",
    "artMedium": "digital image",
    "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
    "copyrightNotice": STRUCTURED_DATA.LEGAL.COPYRIGHT,
    "copyrightYear": new Date(TEST_DRAWING.publishedDate).getFullYear(),
    "creator": {
      "@type": "Person",
      "name": STRUCTURED_DATA.AUTHOR.NAME,
      "url": STRUCTURED_DATA.AUTHOR.URL
    },
    "publisher": {
      "@type": "Organization",
      "name": STRUCTURED_DATA.ORGANIZATION.NAME,
      "url": STRUCTURED_DATA.ORGANIZATION.URL,
      "logo": {
        "@type": "ImageObject",
        "url": STRUCTURED_DATA.ORGANIZATION.LOGO,
        "width": 112,
        "height": 32
      }
    },
    "keywords": TEST_DRAWING.tags.join(", "),
  };
  
  // Verify all required properties
  const requiredProperties = [
    '@context', '@type', '@id', 'name', 'description', 'url', 'image',
    'license', 'creator', 'publisher'
  ];
  
  const missingProperties = requiredProperties.filter(prop => 
    !Object.prototype.hasOwnProperty.call(drawingJsonLd, prop)
  );
  
  if (missingProperties.length === 0) {
    console.log('✅ Drawing JSON-LD contains all required properties');
  } else {
    console.error('❌ Drawing JSON-LD is missing properties:', missingProperties);
  }
  
  // Verify URLs follow the expected pattern
  const urlPattern = new RegExp(`^${STRUCTURED_DATA.ORGANIZATION.URL}`);
  
  if (urlPattern.test(drawingJsonLd['@id']) && 
      urlPattern.test(drawingJsonLd.url) &&
      urlPattern.test(drawingJsonLd.publisher.url)) {
    console.log('✅ All URLs follow the expected pattern');
  } else {
    console.error('❌ Some URLs do not follow the expected pattern');
  }
  
  // Verify cross-references are consistent
  if (drawingJsonLd.license === STRUCTURED_DATA.LEGAL.LICENSE_URL &&
      drawingJsonLd.creator.url === STRUCTURED_DATA.AUTHOR.URL) {
    console.log('✅ Cross-references are consistent');
  } else {
    console.error('❌ Cross-references are inconsistent');
  }
  
  console.log('Drawing JSON-LD test complete');
  console.log('------------------------');
  
  return drawingJsonLd;
}

/**
 * Run all verification tests
 */
function runAllTests() {
  console.log('Starting structured data verification...');
  console.log('------------------------');
  
  // Test STRUCTURED_DATA constants
  console.log('Verifying structured data constants...');
  console.log(`Organization URL: ${STRUCTURED_DATA.ORGANIZATION.URL}`);
  console.log(`License URL: ${STRUCTURED_DATA.LEGAL.LICENSE_URL}`);
  console.log(`Author URL: ${STRUCTURED_DATA.AUTHOR.URL}`);
  console.log('------------------------');
  
  // Run image object test
  const imageObject = verifyImageObject();
  
  // Run drawing JSON-LD test
  const drawingJsonLd = verifyDrawingJsonLd();
  
  console.log('All tests complete!');
  console.log('------------------------');
  
  // Print a sample of the verified JSON-LD
  console.log('Sample JSON-LD output:');
  if (drawingJsonLd) {
    console.log(JSON.stringify(drawingJsonLd, null, 2));
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
} 