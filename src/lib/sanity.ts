import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const config = {
  projectId: 'fn0kjvlp', // Direkte bruk av prosjekt-ID
  dataset: 'production',
  apiVersion: '2024-06-05', // Dagens dato
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
};

// Opprett en klient for å hente data
export const client = createClient(config);

// Opprett en builder for å generere bilde-URL-er
const builder = imageUrlBuilder(client);

// Funksjon for å generere bilde-URL-er
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

// Hjelpefunksjon for å hente alle bilder i en kategori
export async function getImagesInCategory(subcategory: string, page = 1, limit = 30) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return client.fetch(`
    *[_type == "drawingImage" && subcategory._ref == $subcategory && isActive == true]
    | order(order asc, title asc) {
      _id,
      title,
      description,
      metaDescription,
      recommendedAgeRange,
      difficulty,
      order,
      isActive,
      suggestedColors,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      canColorOnline,
      downloadCount
    }[$start...$end]
  `, { subcategory, start, end });
}

// Hent alle hovedkategorier
export async function getAllCategories(locale: string = 'no') {
  return client.fetch(`
    *[_type == "category" && isActive == true && language == $locale]
    | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      seoTitle,
      seoDescription,
      icon,
      order,
      isActive,
      featured,
      image {
        "url": asset->url,
        alt
      },
      "subcategoryCount": count(*[_type == "subcategory" && parentCategory._ref == ^._id && isActive == true && language == $locale]),
      "drawingCount": count(*[_type == "drawingImage" && subcategory->parentCategory._ref == ^._id && isActive == true && language == $locale])
    }
  `, { locale });
}

// GROQ query-funksjon for å hente alle innlegg
export async function getPosts() {
  return await client.fetch(`
    *[_type == "post"] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      categories[]->{
        _id,
        title,
        slug
      }
    }
  `);
}

// GROQ query-funksjon for å hente et spesifikt innlegg basert på slug
export async function getPost(slug: string) {
  return await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      _updatedAt,
      title,
      slug,
      mainImage,
      publishedAt,
      body,
      excerpt,
      categories[]->{
        _id,
        title,
        slug
      }
    }
  `, { slug });
}

// GROQ query-funksjon for å hente alle kategorier
export async function getCategories() {
  return await client.fetch(`
    *[_type == "category"] {
      _id,
      title,
      slug,
      description
    }
  `);
}

// GROQ query-funksjon for å hente innlegg etter kategori
export async function getPostsByCategory(categorySlug: string) {
  return await client.fetch(`
    *[_type == "post" && $categorySlug in categories[]->slug.current] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      categories[]->{
        _id,
        title,
        slug
      }
    }
  `, { categorySlug });
}

// Hent bilde for fargelegging med validering
export async function getColoringImage(id: string) {
  return client.fetch(`
    *[_type == "drawingImage" && (_id == $id || slug.current == $id) && isActive == true][0] {
      _id,
      title,
      description,
      metaDescription,
      recommendedAgeRange,
      "slug": slug.current,
      "imageUrl": displayImage.asset->url,
      "imageLqip": displayImage.asset->metadata.lqip,
      "fallbackImageUrl": webpImage.asset->url,
      "fallbackImageLqip": webpImage.asset->metadata.lqip,
      "thumbnailUrl": thumbnailImage.asset->url,
      "thumbnailLqip": thumbnailImage.asset->metadata.lqip,
      "downloadUrl": downloadFile.asset->url,
      contextContent,
      difficulty,
      hasDigitalColoring,
      publishedDate,
      _createdAt,
      order,
      isActive
    }
  `, { id })
}

// Hent en kategori med sine underkategorier
export async function getCategoryWithSubcategories(categorySlug: string, locale: string = 'no') {
  return client.fetch(`
    *[_type == "category" && slug.current == $categorySlug && isActive == true && language == $locale][0] {
      _id,
      title,
      description,
      seoTitle,
      seoDescription,
      icon,
      order,
      isActive,
      featured,
      "slug": slug.current,
      image {
        "url": asset->url,
        alt
      },
      "subcategories": *[_type == "subcategory" && parentCategory._ref == ^._id && isActive == true && language == $locale]
      | order(order asc, title asc) {
        _id,
        title,
        "slug": slug.current,
        difficulty,
        order,
        isActive,
        description,
        seoTitle,
        seoDescription,
        featuredImage {
          "url": asset->url,
          alt,
          "lqip": asset->metadata.lqip
        },
        "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale]),
        "sampleImage": *[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale][0] {
          "thumbnailUrl": thumbnailImage.asset->url,
          "thumbnailAlt": thumbnailImage.alt,
          "thumbnailLqip": thumbnailImage.asset->metadata.lqip,
          "imageUrl": webpImage.asset->url,
          "imageAlt": webpImage.alt,
          "imageLqip": webpImage.asset->metadata.lqip
        }
      }
    }
  `, { categorySlug, locale });
}

// Hent alle underkategorier for en kategori
export async function getSubcategoriesByCategory(categorySlug: string, locale: string = 'no') {
  return client.fetch(`
    *[_type == "subcategory" && parentCategory->slug.current == $categorySlug && isActive == true && language == $locale]
    | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      difficulty,
      order,
      isActive,
      description,
      seoTitle,
      seoDescription,
      featuredImage {
        "url": asset->url,
        "alt": alt,
        "lqip": asset->metadata.lqip
      },
      "parentCategory": parentCategory->{ title, "slug": slug.current },
      "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale])
    }
  `, { categorySlug, locale });
}

// Hent en spesifikk underkategori med tegninger
export async function getSubcategoryWithDrawings(categorySlug: string, subcategorySlug: string, locale: string = 'no') {
  return client.fetch(`
    *[_type == "subcategory" && slug.current == $subcategorySlug && parentCategory->slug.current == $categorySlug && isActive == true && language == $locale][0] {
      _id,
      title,
      description,
      seoTitle,
      seoDescription,
      difficulty,
      "slug": slug.current,
      featuredImage {
        "url": asset->url,
        "alt": alt
      },
      "parentCategory": parentCategory->{ title, "slug": slug.current },
      "drawings": *[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale]
      | order(order asc, title asc) {
        _id,
        title,
        "slug": slug.current,
        "thumbnail": {
          "url": thumbnailImage.asset->url,
          "alt": thumbnailImage.alt,
          "lqip": thumbnailImage.asset->metadata.lqip
        },
        "displayImage": {
          "url": displayImage.asset->url,
          "alt": displayImage.alt,
          "lqip": displayImage.asset->metadata.lqip
        },
        difficulty,
        order,
        isActive
      }
    }
  `, { categorySlug, subcategorySlug, locale });
}

// Oppdatert getCategoryImagesWithColoring til å støtte underkategorier
export async function getCategoryImagesWithColoring(categorySlug: string) {
  return client.fetch(`
    *[_type == "drawingImage" && category->slug.current == $categorySlug] {
      _id,
      title,
      description,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      difficulty,
      "slug": slug.current,
      "subcategory": subcategory->{ title, "slug": slug.current }
    } | order(_createdAt desc)
  `, { categorySlug })
}

// Hent tegninger for en spesifikk underkategori
export async function getDrawingsBySubcategory(subcategorySlug: string, locale: string = 'no') {
  return client.fetch(`
    *[_type == "drawingImage" && subcategory->slug.current == $subcategorySlug && language == $locale] {
      _id,
      title,
      "slug": slug.current,
      "imageUrl": webpImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      recommendedAgeRange,
      order,
      isActive
    } | order(order asc, title asc)
  `, { subcategorySlug, locale })
}

// Hent alle bilder som kan fargelegges (for static paths)
export async function getAllColoringImages() {
  return client.fetch(`
    *[_type == "drawingImage" && isActive == true]
    | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      "imageUrl": webpImage.asset->url,
      "lqip": webpImage.asset->metadata.lqip,
      "alt": webpImage.alt
    }
  `);
}

// Admin-funksjon: Valider alle fargeleggingsbilder
export async function validateAllColoringImages() {
  const images = await client.fetch(`
    *[_type == "drawingImage" && canColorOnline == true] {
      _id,
      title
    }
  `)
  
  if (typeof window === 'undefined') {
    // Server-side: returnerer bare grunnleggende info
    return images.map((image: any) => ({
      id: image._id,
      title: image.title,
      validation: null
    }))
  }
  
  // Client-side: full validering
  return images.map((image: any) => {
    return {
      id: image._id,
      title: image.title,
      validation: null
    }
  })
}

// Hent bilde med WebP URL for fargelegging
export async function getColoringImageWebP(id: string) {
  return client.fetch(`
    *[_type == "drawingImage" && _id == $id][0] {
      _id,
      title,
      "webpImageUrl": coalesce(webpImage.asset->url, mainImage.asset->url),
      "displayImageUrl": displayImage.asset->url,
      "fallbackImageUrl": mainImage.asset->url,
      suggestedColors,
      "category": subcategory->parentCategory->{ 
        title, 
        "slug": slug.current 
      },
      "subcategory": subcategory->{ 
        title, 
        "slug": slug.current 
      }
    }
  `, { id })
}

// Hent alle fargeleggingsbilder i en underkategori
export async function getSubcategoryColoringImages(categorySlug: string, subcategorySlug: string) {
  return client.fetch(`
    *[_type == "drawingImage" && 
      subcategory->slug.current == $subcategorySlug && 
      subcategory->parentCategory->slug.current == $categorySlug &&
      hasDigitalColoring == true &&
      isActive == true] {
      _id,
      title,
      "webpImageUrl": webpImage.asset->url,
      "thumbnailUrl": mainImage.asset->url,
      suggestedColors,
      "category": subcategory->parentCategory->{ 
        title, 
        "slug": slug.current 
      },
      "subcategory": subcategory->{ 
        title, 
        "slug": slug.current 
      }
    } | order(order asc, title asc)
  `, { categorySlug, subcategorySlug })
}

// Hent alle kategorier med underkategorier for statisk generering
export async function getAllCategoriesWithSubcategories() {
  return client.fetch(`
    *[_type == "category" && isActive == true]
    | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      "subcategories": *[_type == "subcategory" && parentCategory._ref == ^._id && isActive == true]
      | order(order asc, title asc) {
        _id,
        title,
        "slug": slug.current
      }
    }
  `);
}

// Funksjon for å søke etter tegninger
export async function searchDrawings(query: string, limit?: number, locale: string = 'no') {
  const params: { [key: string]: string | number } = { query: `${query}*`, locale };

  let groqQuery = `*[_type == "drawingImage" && (
    title match $query ||
    description match $query ||
    tags[] match $query ||
    subcategory->title match $query ||
    subcategory->parentCategory->title match $query
  ) && isActive == true && language == $locale]`;

  if (typeof limit === 'number') {
    groqQuery += ` | order(_createdAt desc)[0...$limit]`;
    params.limit = limit;
  }

  groqQuery += ` {
      _id,
      title,
      "slug": slug.current,
    "imageUrl": thumbnailImage.asset->url,
    "imageAlt": thumbnailImage.alt,
    "lqip": thumbnailImage.asset->metadata.lqip,
      difficulty,
    "subcategorySlug": subcategory->slug.current,
    "categorySlug": subcategory->parentCategory->slug.current
  }`;

  return client.fetch(groqQuery, params);
}

// Hent alle underkategorier på tvers av alle kategorier
export async function getAllSubcategories(locale: string = 'no') {
  return client.fetch(`
    *[_type == "subcategory" && isActive == true && language == $locale]
    | order(order asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      difficulty,
      order,
      isActive,
      description,
      seoTitle,
      seoDescription,
      featuredImage {
        "url": asset->url,
        "alt": alt,
        "lqip": asset->metadata.lqip
      },
      "parentCategory": parentCategory->{
        _id,
        title,
        "slug": slug.current
      },
      "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale])
    }
  `, { locale });
}

// Hent populære underkategorier basert på antall tegninger
export async function getPopularSubcategories(limit: number = 3, locale: string = 'no') {
  console.log(`Fetching ${limit} popular subcategories for locale: ${locale}`);

  try {
    const result = await client.fetch(`
      *[_type == "subcategory" && isActive == true && language == $locale && defined(featuredImage)] {
        _id,
        title,
        "slug": slug.current,
        featuredImage {
          "url": asset->url,
          "alt": alt,
          "lqip": asset->metadata.lqip
        },
        "parentCategory": parentCategory->{
          title,
          "slug": slug.current
        },
        "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale])
      } | order(drawingCount desc, title asc)[0...${limit}]
    `, { locale });

    console.log('Found popular subcategories:', result);

    // If no results, try to get featured subcategories
    if (!result || result.length === 0) {
      console.log('No popular subcategories found, trying featured subcategories...');
      const featuredResult = await client.fetch(`
        *[_type == "subcategory" && isActive == true && language == $locale && defined(featuredImage) && featured == true] {
          _id,
          title,
          "slug": slug.current,
          featuredImage {
            "url": asset->url,
            "alt": alt,
            "lqip": asset->metadata.lqip
          },
          "parentCategory": parentCategory->{
            title,
            "slug": slug.current
          },
          "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale])
        } | order(order asc, title asc)[0...${limit}]
      `, { locale });

      console.log('Found featured subcategories:', featuredResult);

      // If still no results, just get any subcategories
      if (!featuredResult || featuredResult.length === 0) {
        console.log('No featured subcategories found, getting any subcategories...');
        const anyResult = await client.fetch(`
          *[_type == "subcategory" && isActive == true && language == $locale] {
            _id,
            title,
            "slug": slug.current,
            featuredImage {
              "url": asset->url,
              "alt": alt,
              "lqip": asset->metadata.lqip
            },
            "parentCategory": parentCategory->{
              title,
              "slug": slug.current
            },
            "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale])
          } | order(title asc)[0...${limit}]
        `, { locale });

        console.log('Found any subcategories:', anyResult);
        return anyResult;
      }

      return featuredResult;
    }

    return result;
  } catch (error) {
    console.error('Error fetching popular subcategories:', error);
    return [];
  }
}

// Hent spesifikke underkategorier basert på slugs
export async function getSpecificSubcategories(slugs: string[]) {
  console.log('Fetching subcategories with slugs:', slugs);
  
  // Try to fetch by exact slug match first
  const result = await client.fetch(`
    *[_type == "subcategory" && slug.current in $slugs && isActive == true] {
      _id,
      title,
      "slug": slug.current,
      featuredImage {
        "url": asset->url,
        "alt": alt,
        "lqip": asset->metadata.lqip
      },
      "parentCategory": parentCategory->{ 
        title, 
        "slug": slug.current 
      },
      "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true])
    }
  `, { slugs });
  
  console.log('Found subcategories by slug:', result);
  
  // If no results, try to find by title (case insensitive)
  if (!result || result.length === 0) {
    console.log('No subcategories found by slug, trying by title...');
    const titleResult = await client.fetch(`
      *[_type == "subcategory" && isActive == true && (${slugs.map((slug, i) => `title match "${slug}*"`).join(' || ')})]
      | order(order asc, title asc)[0...3] {
        _id,
        title,
        "slug": slug.current,
        featuredImage {
          "url": asset->url,
          "alt": alt,
          "lqip": asset->metadata.lqip
        },
        "parentCategory": parentCategory->{ 
          title, 
          "slug": slug.current 
        },
        "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true])
      }
    `);
    
    console.log('Found subcategories by title:', titleResult);
    return titleResult;
  }
  
  return result;
}

// Hent relaterte underkategorier
export async function getRelatedSubcategories(
  currentSubcategorySlug: string,
  categorySlug: string,
  limit: number = 4,
  locale: string = 'no'
) {
  return client.fetch(
    `*[_type == "subcategory"
      && slug.current != $currentSubcategorySlug
      && parentCategory->slug.current == $categorySlug
      && isActive == true
      && language == $locale]
    | order(order asc, title asc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      difficulty,
      description,
      featuredImage {
        "url": asset->url,
        "alt": alt,
      },
      "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale]),
      "sampleImage": *[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true && language == $locale][0] {
        "thumbnailUrl": thumbnailImage.asset->url,
        "thumbnailAlt": thumbnailImage.alt,
        "imageUrl": webpImage.asset->url,
        "imageAlt": webpImage.alt
      }
    }`,
    { currentSubcategorySlug, categorySlug, limit, locale }
  );
}

// Hent relaterte tegninger i samme underkategori
export async function getRelatedDrawings(
  currentDrawingSlug: string,
  subcategorySlug: string,
  limit: number = 4,
  locale: string = 'no'
) {
  return client.fetch(
    `*[_type == "drawingImage"
      && slug.current != $currentDrawingSlug
      && subcategory->slug.current == $subcategorySlug
      && isActive == true
      && language == $locale]
    | order(order asc, title asc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      difficulty,
      "imageUrl": thumbnailImage.asset->url,
      "imageAlt": thumbnailImage.alt,
      "lqip": thumbnailImage.asset->metadata.lqip
    }`,
    { currentDrawingSlug, subcategorySlug, limit, locale }
  );
}

// Hent trending underkategorier
export async function getTrendingSubcategories(limit: number = 2, locale: string = 'no') {
  return client.fetch(
    `*[_type == "subcategory" && isTrending == true && isActive == true && language == $locale][0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "parentCategory": parentCategory->{ "slug": slug.current }
    }`,
    { limit, locale }
  );
}

// Hent nyeste underkategorier
export async function getNewestSubcategories(limit: number = 7) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return client.fetch(
    `*[_type == "subcategory" && isActive == true] | order(_createdAt desc)[0...$limit] {
      _id,
      title,
      "slug": slug.current,
      "parentCategory": parentCategory->{ "slug": slug.current },
      "lqip": asset->metadata.lqip
    }`,
    { limit, sevenDaysAgo }
  );
}

export async function getSitemapPageData(locale: string = 'no') {
  return client.fetch(`
    {
      "posts": *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] {
        "slug": slug.current,
        _updatedAt
      },
      "categories": *[_type == "category" && defined(slug.current) && language == $locale && !(_id in path("drafts.**"))] {
        "slug": slug.current,
        _updatedAt
      },
      "subcategories": *[_type == "subcategory" && defined(slug.current) && defined(parentCategory->slug.current) && isActive == true && language == $locale && !(_id in path("drafts.**"))] {
        "slug": slug.current,
        "parentCategorySlug": parentCategory->slug.current,
        _updatedAt
      },
      "drawings": *[_type == "drawingImage" && defined(slug.current) && defined(subcategory->slug.current) && defined(subcategory->parentCategory->slug.current) && isActive == true && language == $locale && !(_id in path("drafts.**"))] {
        "slug": slug.current,
        "subcategorySlug": subcategory->slug.current,
        "parentCategorySlug": subcategory->parentCategory->slug.current,
        _updatedAt
      }
    }
  `, { locale });
}

export async function getSitemapImageData(locale: string = 'no') {
  return client.fetch(`
    *[_type == "drawingImage" && defined(slug.current) && defined(displayImage.asset) && isActive == true && language == $locale && !(_id in path("drafts.**"))] {
      "drawingSlug": slug.current,
      "subcategorySlug": subcategory->slug.current,
      "categorySlug": subcategory->parentCategory->slug.current,
      "imageUrl": displayImage.asset->url,
      title,
      description,
      _updatedAt
    }
  `, { locale });
}

// Hent tegning med fullstendig sti-informasjon for URL-bygging
// Brukes av daily-drawing for å bygge /category/subcategory/drawing URLs
export async function getDrawingWithFullPath(id: string, locale: string = 'no') {
  return client.fetch(`
    *[_type == "drawingImage" && _id == $id && isActive == true && language == $locale][0] {
      _id,
      title,
      "slug": slug.current,
      "categorySlug": subcategory->parentCategory->slug.current,
      "categoryTitle": subcategory->parentCategory->title,
      "subcategorySlug": subcategory->slug.current,
      "subcategoryTitle": subcategory->title,
      isActive
    }
  `, { id, locale });
} 