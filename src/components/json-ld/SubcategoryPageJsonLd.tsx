import { createImageObject } from '@/lib/json-ld-utils';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

// Define type for drawing/coloring page
interface Drawing {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  image?: {
    url?: string;
    alt?: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      }
    }
  };
}

// Define type for subcategory
interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory?: {
    _id: string;
    slug: string;
    title: string;
  };
  drawings?: Drawing[];
  featuredImage?: {
    url?: string;
    alt?: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      }
    }
  };
}

export default function SubcategoryPageJsonLd({ 
  subcategory, 
  pathname 
}: { 
  subcategory: Subcategory;
  pathname: string;
}) {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const currentUrl = `${baseUrl}${pathname}`;
  const subcategoryId = `${baseUrl}${pathname}#subcategory`;
  const categoryId = subcategory.parentCategory 
    ? `${baseUrl}/${subcategory.parentCategory.slug}#category` 
    : undefined;
  const subcategoryImageUrl = subcategory.featuredImage?.url;
  
  // Create image object for subcategory
  const subcategoryImage = subcategoryImageUrl ? createImageObject(
    subcategoryImageUrl,
    subcategory.featuredImage?.alt || subcategory.title,
    subcategory.featuredImage?.metadata?.dimensions ? {
      width: subcategory.featuredImage.metadata.dimensions.width || 800,
      height: subcategory.featuredImage.metadata.dimensions.height || 600
    } : undefined,
    `${subcategory.title} fargeleggingsark kategori`
  ) : null;
  
  // Create an array of graph items
  const graphItems = [];
  
  // Create hasPart array for the drawings in this subcategory
  const hasPart = subcategory.drawings?.map(drawing => ({
    "@id": `${baseUrl}${pathname}/${drawing.slug}#drawing`
  })) || [];
  
  // Try to identify a Wikipedia page for the subcategory (for about property)
  let aboutObject = null;
  const subcategoryLowercase = subcategory.title.toLowerCase();
  
  // Common subcategories that might have Wikipedia entries
  if (subcategoryLowercase.includes('hund') || 
      subcategoryLowercase.includes('dog')) {
    aboutObject = {
      "@type": "Thing",
      "name": "Hund",
      "sameAs": "https://no.wikipedia.org/wiki/Hund"
    };
  } else if (subcategoryLowercase.includes('katt') || 
             subcategoryLowercase.includes('cat')) {
    aboutObject = {
      "@type": "Thing",
      "name": "Katt",
      "sameAs": "https://no.wikipedia.org/wiki/Katt"
    };
  } else if (subcategoryLowercase.includes('dinosaur')) {
    aboutObject = {
      "@type": "Thing",
      "name": "Dinosaur",
      "sameAs": "https://no.wikipedia.org/wiki/Dinosaurer"
    };
  }
  
  // Add main subcategory page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": subcategoryId,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "URL",
      "value": currentUrl
    },
    "name": (subcategory.seoTitle || subcategory.title) + " – Fargeleggingsark",
    "description": subcategory.seoDescription || subcategory.description || `Fargeleggingsark med ${subcategory.title.toLowerCase()}-tema for barn.`,
    "url": currentUrl,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    ...(subcategoryImage && { 
      "image": subcategoryImage,
      "thumbnailUrl": subcategoryImageUrl 
    }),
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "3",
      "suggestedMaxAge": "12"
    },
    "contentRating": "G",
    ...(aboutObject && { "about": aboutObject }),
    ...(subcategory.drawings && subcategory.drawings.length > 0 && {
      "mainEntity": {
        "@type": "ItemList",
        "name": `${subcategory.title} fargeleggingsbilder`,
        "description": `Utforsk alle ${subcategory.title.toLowerCase()} fargeleggingsbilder for barn, inkludert ${subcategory.drawings.map(d => d.title).slice(0, 3).join(', ')}${subcategory.drawings.length > 3 ? ' og flere' : ''}.`,
        "itemListElement": subcategory.drawings.map((drawing, index) => {
          const drawingImageUrl = drawing.image?.url;
          
          // Create image object for drawing
          const drawingImage = drawingImageUrl ? createImageObject(
            drawingImageUrl,
            drawing.image?.alt || drawing.title,
            drawing.image?.metadata?.dimensions ? {
              width: drawing.image.metadata.dimensions.width || 800,
              height: drawing.image.metadata.dimensions.height || 600
            } : undefined,
            `${drawing.title} fargeleggingsark`
          ) : null;
          
          return {
            "@type": "ListItem",
            "position": index + 1,
            "name": drawing.seoTitle || drawing.title,
            "url": `${baseUrl}${pathname}/${drawing.slug}`,
            ...(drawingImage && { 
              "image": drawingImage,
              "thumbnailUrl": drawingImageUrl 
            }),
            "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`,
            "item": {
              "@id": `${baseUrl}${pathname}/${drawing.slug}#drawing`
            }
          };
        })
      }
    }),
    "hasPart": hasPart,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Hjem",
          "item": baseUrl
        },
        ...(subcategory.parentCategory ? [
          {
            "@type": "ListItem",
            "position": 2,
            "name": subcategory.parentCategory.title,
            "item": `${baseUrl}/${subcategory.parentCategory.slug}`
          }
        ] : []),
        {
          "@type": "ListItem",
          "position": subcategory.parentCategory ? 3 : 2,
          "name": subcategory.title,
          "item": currentUrl
        }
      ]
    },
    ...(categoryId && {
      "isPartOf": {
        "@id": categoryId
      }
    }),
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "license": STRUCTURED_DATA.LEGAL.LICENSE_URL
  });
  
  // Add drawing pages if available
  if (subcategory.drawings && subcategory.drawings.length > 0) {
    subcategory.drawings.forEach(drawing => {
      const drawingImageUrl = drawing.image?.url;
      
      // Create image object for drawing page
      const drawingImage = drawingImageUrl ? createImageObject(
        drawingImageUrl,
        drawing.image?.alt || drawing.title,
        drawing.image?.metadata?.dimensions ? {
          width: drawing.image.metadata.dimensions.width || 800,
          height: drawing.image.metadata.dimensions.height || 600
        } : undefined,
        `${drawing.title} fargeleggingsark`
      ) : null;
      
      graphItems.push({
        "@type": "WebPage",
        "@id": `${baseUrl}${pathname}/${drawing.slug}#drawing`,
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "URL",
          "value": `${baseUrl}${pathname}/${drawing.slug}`
        },
        "name": `${drawing.seoTitle || drawing.title} – Fargeleggingsark`,
        "url": `${baseUrl}${pathname}/${drawing.slug}`,
        "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
        ...(drawingImage && { 
          "image": drawingImage,
          "thumbnailUrl": drawingImageUrl 
        }),
        "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`,
        "isPartOf": {
          "@id": subcategoryId
        },
        "potentialAction": [
          {
            "@type": "ViewAction",
            "target": `${baseUrl}${pathname}/${drawing.slug}`,
            "name": `Se ${drawing.title} fargeleggingsark`
          }
        ],
        "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
        "author": {
          "@type": "Person",
          "name": STRUCTURED_DATA.AUTHOR.NAME,
          "url": STRUCTURED_DATA.AUTHOR.URL
        },
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "audience": {
          "@type": "PeopleAudience",
          "suggestedMinAge": "3",
          "suggestedMaxAge": "12"
        },
        "contentRating": "G"
      });
    });
  }
  
  // Prepare JSON-LD data with @graph
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 