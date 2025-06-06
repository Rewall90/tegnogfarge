// Define type for subcategory
interface Subcategory {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: {
    url?: string;
    alt?: string;
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
  subcategories?: Subcategory[];
  image?: {
    url?: string;
    alt?: string;
  };
}

export default function CategoryPageJsonLd({ 
  category, 
  pathname 
}: { 
  category: Category;
  pathname: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  const currentUrl = `${baseUrl}${pathname}`;
  const categoryId = `${baseUrl}/${category.slug}`;
  const categoryImageUrl = category.image?.url;
  
  // Create an array of graph items
  const graphItems = [];
  
  // Create hasPart array for the main category
  const hasPart = category.subcategories?.map(subcategory => ({
    "@type": "CollectionPage",
    "@id": `${baseUrl}/${category.slug}/${subcategory.slug}`
  })) || [];
  
  // Add main category page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": categoryId,
    "name": (category.seoTitle || category.title) + " – Fargeleggingsark",
    "description": category.seoDescription || category.description || `Oppdag vårt utvalg av fargeleggingsark med ${category.title.toLowerCase()}.`,
    "url": currentUrl,
    "inLanguage": "nb-NO",
    ...(categoryImageUrl && { 
      "image": categoryImageUrl,
      "thumbnailUrl": categoryImageUrl 
    }),
    "mainEntity": {
      "@type": "ItemList",
      "name": `${category.title} fargeleggingsbilder`,
      "description": `Utforsk alle ${category.title.toLowerCase()} fargeleggingsbilder for barn, inkludert ${category.subcategories?.map(s => s.title).slice(0, 3).join(', ')}${category.subcategories && category.subcategories.length > 3 ? ' og flere' : ''}.`,
      "itemListElement": category.subcategories?.map((subcategory, index) => {
        // Store the image URL to avoid redundant property access
        const subcategoryImageUrl = subcategory.featuredImage?.url;
        return {
          "@type": "ListItem",
          "position": index + 1,
          "name": subcategory.seoTitle || subcategory.title,
          "url": `${baseUrl}/${category.slug}/${subcategory.slug}`,
          ...(subcategoryImageUrl && { 
            "image": subcategoryImageUrl,
            "thumbnailUrl": subcategoryImageUrl
          }),
          "description": subcategory.description || `Fargeleggingsark med ${subcategory.title}-tema for barn.`
        };
      }) || []
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
          "name": category.title,
          "item": currentUrl
        }
      ]
    }
  });
  
  // Add subcategory pages
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach(subcategory => {
      const subcategoryImageUrl = subcategory.featuredImage?.url;
      graphItems.push({
        "@type": "CollectionPage",
        "@id": `${baseUrl}/${category.slug}/${subcategory.slug}`,
        "name": `${subcategory.seoTitle || subcategory.title} – Fargeleggingsark`,
        "url": `${baseUrl}/${category.slug}/${subcategory.slug}`,
        "inLanguage": "nb-NO",
        ...(subcategoryImageUrl && { 
          "image": subcategoryImageUrl,
          "thumbnailUrl": subcategoryImageUrl
        }),
        "description": subcategory.description || `Fargeleggingsark med ${subcategory.title}-tema for barn.`,
        "isPartOf": {
          "@id": categoryId
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