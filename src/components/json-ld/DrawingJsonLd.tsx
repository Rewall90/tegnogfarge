import { createImageObject } from '@/lib/json-ld-utils';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

// Define type for drawing/coloring page
interface Drawing {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  metaDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  publishedDate?: string;
  _createdAt?: string;
  recommendedAgeRange?: string;
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

interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  parentCategory?: {
    _id: string;
    slug: string;
    title: string;
  };
}

export default function DrawingJsonLd({ 
  drawing, 
  pathname,
  subcategory
}: { 
  drawing: Drawing;
  pathname: string;
  subcategory?: Subcategory;
}) {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const currentUrl = `${baseUrl}${pathname}`;
  
  // Get image URLs
  const mainImageUrl = drawing.image?.url || drawing.imageUrl || drawing.fallbackImageUrl;
  const thumbnailImageUrl = drawing.thumbnailUrl || mainImageUrl;
  
  // Extract image dimensions if available
  const imageDimensions = drawing.image?.metadata?.dimensions ? {
    width: drawing.image.metadata.dimensions.width || 800,
    height: drawing.image.metadata.dimensions.height || 600
  } : undefined;
  
  // Create the main image object with full metadata
  const mainImage = mainImageUrl ? createImageObject(
    mainImageUrl,
    drawing.image?.alt || drawing.title,
    imageDimensions,
    `${drawing.title} fargeleggingsark`
  ) : null;
  
  // Create the thumbnail image object
  const thumbnailImage = thumbnailImageUrl ? createImageObject(
    thumbnailImageUrl,
    drawing.image?.alt || drawing.title,
    { width: 300, height: 300 },
    `${drawing.title} fargeleggingsark - miniatyrbilde`
  ) : null;
  
  // Format publication date or use creation date as fallback
  const datePublished = drawing.publishedDate || drawing._createdAt || new Date().toISOString();
  
  // Format difficulty level
  let difficultyLevel = "medium";
  if (drawing.difficulty === 'easy') difficultyLevel = "beginner";
  if (drawing.difficulty === 'hard') difficultyLevel = "expert";
  
  // Map age range to intended audience
  let intendedAudience = "";
  switch (drawing.recommendedAgeRange) {
    case '3-5': intendedAudience = "Småbarn 3-5 år"; break;
    case '6-8': intendedAudience = "Barn 6-8 år"; break;
    case '9-12': intendedAudience = "Barn 9-12 år"; break;
    case '12+': intendedAudience = "Barn over 12 år"; break;
    default: intendedAudience = "Alle aldre"; break;
  }
  
  // Try to identify subject for about property based on title or description
  let aboutObject = null;
  const titleLowercase = drawing.title.toLowerCase();
  const descriptionText = drawing.metaDescription || drawing.description || '';
  const allText = titleLowercase + ' ' + descriptionText.toLowerCase();
  
  // Check for common themes
  if (allText.includes('dinosaur')) {
    aboutObject = {
      "@type": "Thing",
      "name": "Dinosaurer",
      "sameAs": "https://no.wikipedia.org/wiki/Dinosaurer"
    };
  } else if (allText.includes('jul') || allText.includes('christmas')) {
    aboutObject = {
      "@type": "Thing",
      "name": "Jul",
      "sameAs": "https://no.wikipedia.org/wiki/Jul"
    };
  } else if (allText.includes('påske') || allText.includes('easter')) {
    aboutObject = {
      "@type": "Thing",
      "name": "Påske",
      "sameAs": "https://no.wikipedia.org/wiki/P%C3%A5ske"
    };
  }
  
  // Build breadcrumb
  const breadcrumbItems = [
    {
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
      "position": 1,
      "name": "Hjem",
      "item": baseUrl
    }
  ];
  
  // Add category/subcategory to breadcrumb if available
  if (subcategory?.parentCategory) {
    breadcrumbItems.push({
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
      "position": 2,
      "name": subcategory.parentCategory.title,
      "item": `${baseUrl}/${subcategory.parentCategory.slug}`
    });
    
    breadcrumbItems.push({
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
      "position": 3,
      "name": subcategory.title,
      "item": `${baseUrl}/${subcategory.parentCategory.slug}/${subcategory.slug}`
    });
    
    breadcrumbItems.push({
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
      "position": 4,
      "name": drawing.title,
      "item": currentUrl
    });
  } else {
    breadcrumbItems.push({
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.LIST_ITEM,
      "position": 2,
      "name": drawing.title,
      "item": currentUrl
    });
  }
  
  // Generate graph array
  const graphItems = [];
  
  // Prepare primary image reference
  const primaryImageId = `${currentUrl}#primaryimage`;
  
  // Add main VisualArtwork entity
  graphItems.push({
    "@type": "VisualArtwork",
    "@id": `${currentUrl}#drawing`,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "URL",
      "value": currentUrl
    },
    "name": drawing.seoTitle || drawing.title,
    "headline": drawing.seoTitle || drawing.title,
    "description": drawing.seoDescription || drawing.description || `Fargeleggingsark - ${drawing.title}`,
    "url": currentUrl,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    "datePublished": datePublished,
    "dateModified": datePublished,
    "image": mainImageUrl ? { "@id": primaryImageId } : undefined,
    "thumbnailUrl": thumbnailImageUrl,
    "artform": "Coloring Page",
    "artworkSurface": "paper",
    "artMedium": "digital image",
    "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
    "copyrightNotice": STRUCTURED_DATA.LEGAL.COPYRIGHT,
    "copyrightYear": new Date(datePublished).getFullYear(),
    "creator": {
      "@type": "Person",
      "name": STRUCTURED_DATA.AUTHOR.NAME,
      "url": STRUCTURED_DATA.AUTHOR.URL
    },
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "NOK",
      "availability": "https://schema.org/InStock",
      "url": currentUrl
    },
    "keywords": drawing.title,
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "3",
      "suggestedMaxAge": "12"
    },
    "contentRating": "G",
    ...(aboutObject && { "about": aboutObject }),
    "workExample": [
      {
        "@type": "DigitalDocument",
        "encodingFormat": "application/pdf",
        "contentUrl": drawing.downloadUrl
      }
    ],
    "skill": difficultyLevel,
    "mainEntityOfPage": {
      "@id": currentUrl
    },
    "isPartOf": [
      { "@id": `${baseUrl}/#website` },
      ...(subcategory && subcategory.parentCategory 
        ? [{ "@id": `${baseUrl}/${subcategory.parentCategory.slug}/${subcategory.slug}#subcategory` }] 
        : [])
    ]
  });
  
  // Define actions for the WebPage
  const webPageActions = [
    {
      "@type": "ViewAction",
      "target": currentUrl,
      "name": `Se ${drawing.title} fargeleggingsark`
    }
  ];
  
  // Add download action if available
  if (drawing.downloadUrl) {
    webPageActions.push({
      "@type": "DownloadAction",
      "target": drawing.downloadUrl,
      "name": `Last ned ${drawing.title} fargeleggingsark`
    });
  }
  
  // Add coloring app action if available
  if (drawing.hasDigitalColoring) {
    webPageActions.push({
      "@type": "InteractAction",
      "target": `${baseUrl}/coloring-app?id=${drawing._id}`,
      "name": `Fargelegg ${drawing.title} online`
    });
  }
  
  // Add WebPage entity
  graphItems.push({
    "@type": "WebPage",
    "@id": currentUrl,
    "url": currentUrl,
    "name": `${drawing.seoTitle || drawing.title} - Fargeleggingsark`,
    "description": drawing.seoDescription || drawing.description || `Fargeleggingsark - ${drawing.title}`,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    "datePublished": datePublished,
    "dateModified": datePublished,
    "isPartOf": {
      "@id": `${baseUrl}/#website`
    },
    "breadcrumb": {
      "@type": STRUCTURED_DATA.SCHEMA_TYPES.BREADCRUMB,
      "itemListElement": breadcrumbItems
    },
    "primaryImageOfPage": mainImageUrl ? { "@id": primaryImageId } : undefined,
    "image": mainImageUrl ? { "@id": primaryImageId } : undefined,
    "thumbnailUrl": thumbnailImageUrl,
    "potentialAction": webPageActions,
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "3",
      "suggestedMaxAge": "12"
    },
    "contentRating": "G",
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
    "mainEntity": {
      "@id": `${currentUrl}#drawing`
    }
  });
  
  // If digital coloring is available, add SoftwareApplication entity
  if (drawing.hasDigitalColoring) {
    graphItems.push({
      "@type": "SoftwareApplication",
      "@id": `${baseUrl}/coloring-app?id=${drawing._id}#coloringapp`,
      "name": "Tegn og Farge Digital Fargeleggingsapp",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "NOK",
        "availability": "https://schema.org/InStock"
      },
      "browserRequirements": "Requires JavaScript. Works best in modern browsers.",
      "softwareVersion": "1.0",
      "interactivityType": "active",
      "isAccessibleForFree": true,
      "isRelatedTo": {
        "@id": `${currentUrl}#drawing`
      },
      "publisher": {
        "@id": `${baseUrl}/#organization`
      }
    });
  }
  
  // Add primary image entity if there is an image
  if (mainImage && mainImageUrl) {
    // Extract properties from mainImage excluding @type to avoid duplication
    const { url, contentUrl, width, height, caption, name, alternateName, license, author, 
            copyrightNotice, acquireLicensePage, encodingFormat } = mainImage;
    
    graphItems.push({
      "@type": "ImageObject",
      "@id": primaryImageId,
      "url": url,
      "contentUrl": contentUrl,
      "width": width,
      "height": height,
      "caption": caption,
      "name": name,
      ...(alternateName && { "alternateName": alternateName }),
      "license": license,
      "author": author,
      "copyrightNotice": copyrightNotice,
      "acquireLicensePage": acquireLicensePage,
      "encodingFormat": encodingFormat
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graphItems }) }}
    />
  );
} 