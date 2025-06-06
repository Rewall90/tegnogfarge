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
  };
}

export default function SubcategoryPageJsonLd({ 
  subcategory, 
  pathname 
}: { 
  subcategory: Subcategory;
  pathname: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  const currentUrl = `${baseUrl}${pathname}`;
  const subcategoryId = `${baseUrl}${pathname}`;
  const categoryId = subcategory.parentCategory 
    ? `${baseUrl}/${subcategory.parentCategory.slug}` 
    : undefined;
  const subcategoryImageUrl = subcategory.featuredImage?.url;
  
  // Create an array of graph items
  const graphItems = [];
  
  // Create hasPart array for the drawings in this subcategory
  const hasPart = subcategory.drawings?.map(drawing => ({
    "@type": "WebPage",
    "@id": `${baseUrl}${pathname}/${drawing.slug}`
  })) || [];
  
  // Add main subcategory page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": subcategoryId,
    "name": (subcategory.seoTitle || subcategory.title) + " – Fargeleggingsark",
    "description": subcategory.seoDescription || subcategory.description || `Fargeleggingsark med ${subcategory.title.toLowerCase()}-tema for barn.`,
    "url": currentUrl,
    "inLanguage": "nb-NO",
    ...(subcategoryImageUrl && { 
      "image": subcategoryImageUrl,
      "thumbnailUrl": subcategoryImageUrl 
    }),
    ...(subcategory.drawings && subcategory.drawings.length > 0 && {
      "mainEntity": {
        "@type": "ItemList",
        "name": `${subcategory.title} fargeleggingsbilder`,
        "description": `Utforsk alle ${subcategory.title.toLowerCase()} fargeleggingsbilder for barn, inkludert ${subcategory.drawings.map(d => d.title).slice(0, 3).join(', ')}${subcategory.drawings.length > 3 ? ' og flere' : ''}.`,
        "itemListElement": subcategory.drawings.map((drawing, index) => {
          const drawingImageUrl = drawing.image?.url;
          return {
            "@type": "ListItem",
            "position": index + 1,
            "name": drawing.seoTitle || drawing.title,
            "url": `${baseUrl}${pathname}/${drawing.slug}`,
            ...(drawingImageUrl && { 
              "image": drawingImageUrl,
              "thumbnailUrl": drawingImageUrl 
            }),
            "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`
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
    })
  });
  
  // Add drawing pages if available
  if (subcategory.drawings && subcategory.drawings.length > 0) {
    subcategory.drawings.forEach(drawing => {
      const drawingImageUrl = drawing.image?.url;
      graphItems.push({
        "@type": "WebPage",
        "@id": `${baseUrl}${pathname}/${drawing.slug}`,
        "name": `${drawing.seoTitle || drawing.title} – Fargeleggingsark`,
        "url": `${baseUrl}${pathname}/${drawing.slug}`,
        "inLanguage": "nb-NO",
        ...(drawingImageUrl && { 
          "image": drawingImageUrl,
          "thumbnailUrl": drawingImageUrl 
        }),
        "description": drawing.description || `${subcategory.title} fargeleggingsark - ${drawing.title}`,
        "isPartOf": {
          "@id": subcategoryId
        }
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