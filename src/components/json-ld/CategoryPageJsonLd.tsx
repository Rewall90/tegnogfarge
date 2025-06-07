import { createImageObject } from '@/lib/json-ld-utils';
import { STRUCTURED_DATA } from '@/lib/structured-data-constants';

// Define type for subcategory
interface Subcategory {
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

// Define type for category
interface Category {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
  subcategories?: Subcategory[];
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

export default function CategoryPageJsonLd({ 
  category, 
  pathname 
}: { 
  category: Category;
  pathname: string;
}) {
  const baseUrl = STRUCTURED_DATA.ORGANIZATION.URL;
  const currentUrl = `${baseUrl}${pathname}`;
  const categoryId = `${currentUrl}#category`;
  const categoriesListId = `${baseUrl}/kategorier#categories-list`;
  
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
  
  // Create an array of graph items
  const graphItems = [];
  
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
  
  // Create hasPart array for subcategories
  const hasPart = category.subcategories?.map(subcategory => ({
    "@id": `${baseUrl}/${category.slug}/${subcategory.slug}#subcategory`
  })) || [];
  
  // Add main category page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": categoryId,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "URL",
      "value": currentUrl
    },
    "name": (category.seoTitle || category.title) + " – Fargeleggingsark",
    "description": category.seoDescription || category.description || `Fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`,
    "url": currentUrl,
    "inLanguage": STRUCTURED_DATA.SITE.LANGUAGE,
    ...(categoryImage && { 
      "image": categoryImage,
      "thumbnailUrl": categoryImageUrl 
    }),
    "isPartOf": {
      "@id": categoriesListId
    },
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "3",
      "suggestedMaxAge": "12"
    },
    "contentRating": "G",
    ...(aboutObject && { "about": aboutObject }),
    ...(category.subcategories && category.subcategories.length > 0 && {
      "mainEntity": {
        "@type": "ItemList",
        "name": `${category.title} fargeleggingsbilder kategorier`,
        "description": `Utforsk alle ${category.title.toLowerCase()} underkategorier for fargeleggingsbilder, inkludert ${category.subcategories.map(sub => sub.title).slice(0, 3).join(', ')}${category.subcategories.length > 3 ? ' og flere' : ''}.`,
        "itemListElement": category.subcategories.map((subcategory, index) => {
          const subcategoryImageUrl = subcategory.image?.url || subcategory.imageUrl;
          
          // Create image object for subcategory
          const subcategoryImage = subcategoryImageUrl ? createImageObject(
            subcategoryImageUrl,
            subcategory.image?.alt || subcategory.title,
            subcategory.image?.metadata?.dimensions ? {
              width: subcategory.image.metadata.dimensions.width || 800,
              height: subcategory.image.metadata.dimensions.height || 600
            } : undefined,
            `${subcategory.title} fargeleggingsark kategori`
          ) : null;
          
          return {
            "@type": "ListItem",
            "position": index + 1,
            "name": subcategory.seoTitle || subcategory.title,
            "url": `${baseUrl}/${category.slug}/${subcategory.slug}`,
            ...(subcategoryImage && { 
              "image": subcategoryImage,
              "thumbnailUrl": subcategoryImageUrl 
            }),
            "description": subcategory.description || `${subcategory.title} fargeleggingsark for barn i ${category.title.toLowerCase()}-kategorien.`,
            "item": {
              "@id": `${baseUrl}/${category.slug}/${subcategory.slug}#subcategory`
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
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Kategorier",
          "item": `${baseUrl}/kategorier`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.title,
          "item": currentUrl
        }
      ]
    },
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "license": STRUCTURED_DATA.LEGAL.LICENSE_URL
  });
  
  // Add subcategory stubs for better interlinking
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach(subcategory => {
      // Get the image URL
      const subcategoryImageUrl = subcategory.image?.url || subcategory.imageUrl;
      
      // Create image object for subcategory page
      const subcategoryImage = subcategoryImageUrl ? createImageObject(
        subcategoryImageUrl,
        subcategory.image?.alt || subcategory.title,
        subcategory.image?.metadata?.dimensions ? {
          width: subcategory.image.metadata.dimensions.width || 800,
          height: subcategory.image.metadata.dimensions.height || 600
        } : undefined,
        `${subcategory.title} fargeleggingsark kategori`
      ) : null;
      
      graphItems.push({
        "@type": "CollectionPage",
        "@id": `${baseUrl}/${category.slug}/${subcategory.slug}#subcategory`,
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "URL",
          "value": `${baseUrl}/${category.slug}/${subcategory.slug}`
        },
        "name": `${subcategory.seoTitle || subcategory.title} – ${category.title} Fargeleggingsark`,
        "url": `${baseUrl}/${category.slug}/${subcategory.slug}`,
        "isPartOf": {
          "@id": categoryId
        },
        "mainEntityOfPage": {
          "@id": `${baseUrl}/${category.slug}/${subcategory.slug}`
        },
        ...(subcategoryImage && { 
          "image": subcategoryImage,
          "thumbnailUrl": subcategoryImageUrl 
        })
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