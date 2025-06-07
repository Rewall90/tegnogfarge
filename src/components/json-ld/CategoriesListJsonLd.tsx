import { createImageObject } from '@/lib/json-ld-utils';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

// Define type for category
interface Category {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
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

export default function CategoriesListJsonLd({ 
  categories, 
  pathname 
}: { 
  categories: Category[];
  pathname: string;
}) {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const currentUrl = `${baseUrl}${pathname}`;
  const categoriesId = `${baseUrl}${pathname}#categories-list`;
  
  // Create an array of graph items
  const graphItems = [];
  
  // Create hasPart array for the categories list
  const hasPart = categories.map(category => ({
    "@id": `${baseUrl}/${category.slug}#category`
  }));
  
  // Add main categories listing page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": categoriesId,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "URL",
      "value": currentUrl
    },
    "name": "Fargeleggingsbilder Kategorier",
    "description": "Utforsk alle kategorier av fargeleggingsbilder for barn og voksne.",
    "url": currentUrl,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    "isPartOf": {
      "@id": `${baseUrl}/#website`
    },
    "about": {
      "@type": "Thing",
      "name": "Fargeleggingsbilder for barn",
      "description": "Kreative aktiviteter for barn i form av fargeleggingsark sortert i kategorier."
    },
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "3",
      "suggestedMaxAge": "12"
    },
    "contentRating": "G",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Kategorier av fargeleggingsbilder",
      "description": `Utforsk populære kategorier av fargeleggingsbilder for barn, inkludert ${categories.slice(0, 3).map(cat => cat.title).join(', ')}${categories.length > 3 ? ' og flere' : ''}.`,
      "itemListElement": categories.map((category, index) => {
        // Get the image URL
        const categoryImageUrl = category.image?.url || category.imageUrl;
        
        // Create image object for category
        const categoryImage = categoryImageUrl ? createImageObject(
          categoryImageUrl,
          category.image?.alt || category.title,
          category.image?.metadata?.dimensions ? {
            width: category.image.metadata.dimensions.width || 800,
            height: category.image.metadata.dimensions.height || 600
          } : undefined,
          `${category.title} fargeleggingsark kategori`
        ) : null;
        
        return {
          "@type": "ListItem",
          "position": index + 1,
          "name": category.seoTitle || category.title,
          "url": `${baseUrl}/${category.slug}`,
          ...(categoryImage && { 
            "image": categoryImage,
            "thumbnailUrl": categoryImageUrl 
          }),
          "description": category.description || `Utforsk våre fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`,
          "item": {
            "@id": `${baseUrl}/${category.slug}#category`
          }
        };
      })
    },
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
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Kategorier",
          "item": currentUrl
        }
      ]
    },
    "publisher": {
      "@id": `${baseUrl}/#organization`
    }
  });
  
  // Add category pages
  categories.forEach(category => {
    // Get the image URL
    const categoryImageUrl = category.image?.url || category.imageUrl;
    
    // Create image object for category page
    const categoryImage = categoryImageUrl ? createImageObject(
      categoryImageUrl,
      category.image?.alt || category.title,
      category.image?.metadata?.dimensions ? {
        width: category.image.metadata.dimensions.width || 800,
        height: category.image.metadata.dimensions.height || 600
      } : undefined,
      `${category.title} fargeleggingsark kategori`
    ) : null;
    
    // Try to identify a Wikipedia page for the category (for about property)
    let aboutObject = null;
    const categoryLowercase = category.title.toLowerCase();
    
    // Common categories that might have Wikipedia entries
    if (categoryLowercase.includes('dyr') || 
        categoryLowercase.includes('animal')) {
      aboutObject = {
        "@type": "Thing",
        "name": "Dyr",
        "sameAs": "https://no.wikipedia.org/wiki/Dyr"
      };
    } else if (categoryLowercase.includes('natur') || 
               categoryLowercase.includes('nature')) {
      aboutObject = {
        "@type": "Thing",
        "name": "Natur",
        "sameAs": "https://no.wikipedia.org/wiki/Natur"
      };
    } else if (categoryLowercase.includes('superhelt') || 
               categoryLowercase.includes('superhero')) {
      aboutObject = {
        "@type": "Thing",
        "name": "Superhelt",
        "sameAs": "https://no.wikipedia.org/wiki/Superhelt"
      };
    }
    
    graphItems.push({
      "@type": "CollectionPage",
      "@id": `${baseUrl}/${category.slug}#category`,
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "URL",
        "value": `${baseUrl}/${category.slug}`
      },
      "name": `${category.seoTitle || category.title} – Fargeleggingsark`,
      "url": `${baseUrl}/${category.slug}`,
      "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
      ...(categoryImage && { "image": categoryImage }),
      "description": category.description || `Utforsk våre fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`,
      "isPartOf": {
        "@id": categoriesId
      },
      "audience": {
        "@type": "PeopleAudience",
        "suggestedMinAge": "3",
        "suggestedMaxAge": "12"
      },
      "contentRating": "G",
      "license": STRUCTURED_DATA.LEGAL.LICENSE_URL,
      ...(aboutObject && { "about": aboutObject }),
      "potentialAction": [
        {
          "@type": "ViewAction",
          "target": `${baseUrl}/${category.slug}`,
          "name": `Se ${category.title} fargeleggingsark`
        }
      ],
      "mainEntityOfPage": {
        "@id": `${baseUrl}/${category.slug}`
      },
      "publisher": {
        "@id": `${baseUrl}/#organization`
      }
    });
  });
  
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