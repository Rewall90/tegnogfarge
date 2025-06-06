// Define type for category
interface Category {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
}

export default function CategoriesListJsonLd({ 
  categories, 
  pathname 
}: { 
  categories: Category[];
  pathname: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fargelegg.no';
  const currentUrl = `${baseUrl}${pathname}`;
  const categoriesId = `${baseUrl}/categories`;
  
  // Create an array of graph items
  const graphItems = [];
  
  // Create hasPart array for the categories list
  const hasPart = categories.map(category => ({
    "@type": "CollectionPage",
    "@id": `${baseUrl}/${category.slug}`
  }));
  
  // Add main categories listing page
  graphItems.push({
    "@type": "CollectionPage",
    "@id": categoriesId,
    "name": "Fargeleggingsbilder Kategorier",
    "description": "Utforsk alle kategorier av fargeleggingsbilder for barn og voksne.",
    "url": currentUrl,
    "inLanguage": "nb-NO",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Kategorier av fargeleggingsbilder",
      "description": `Utforsk populære kategorier av fargeleggingsbilder for barn, inkludert ${categories.slice(0, 3).map(cat => cat.title).join(', ')}${categories.length > 3 ? ' og flere' : ''}.`,
      "itemListElement": categories.map((category, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": category.seoTitle || category.title,
        "url": `${baseUrl}/${category.slug}`,
        ...(category.imageUrl && { 
          "image": category.imageUrl,
          "thumbnailUrl": category.imageUrl 
        }),
        "description": category.description || `Utforsk våre fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`
      }))
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
    }
  });
  
  // Add category pages
  categories.forEach(category => {
    graphItems.push({
      "@type": "CollectionPage",
      "@id": `${baseUrl}/${category.slug}`,
      "name": `${category.seoTitle || category.title} – Fargeleggingsark`,
      "url": `${baseUrl}/${category.slug}`,
      "inLanguage": "nb-NO",
      ...(category.imageUrl && { "image": category.imageUrl }),
      "description": category.description || `Utforsk våre fargeleggingsark med ${category.title.toLowerCase()}-tema for barn.`,
      "isPartOf": {
        "@id": categoriesId
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