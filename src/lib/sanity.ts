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
      difficulty,
      order,
      isActive,
      suggestedColors,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      canColorOnline,
      downloadCount,
      tags
    }[$start...$end]
  `, { subcategory, start, end });
}

// Hent alle hovedkategorier
export async function getAllCategories() {
  return client.fetch(`
    *[_type == "category" && isActive == true]
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
      "imageUrl": image.asset->url,
      "subcategoryCount": count(*[_type == "subcategory" && parentCategory._ref == ^._id && isActive == true]),
      "drawingCount": count(*[_type == "drawingImage" && subcategory->parentCategory._ref == ^._id && isActive == true])
    }
  `);
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
      "slug": slug.current,
      "imageUrl": displayImage.asset->url,
      "fallbackImageUrl": webpImage.asset->url,
      "thumbnailUrl": thumbnailImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      tags,
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
export async function getCategoryWithSubcategories(categorySlug: string) {
  return client.fetch(`
    *[_type == "category" && slug.current == $categorySlug && isActive == true][0] {
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
      "subcategories": *[_type == "subcategory" && parentCategory._ref == ^._id && isActive == true]
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
          alt
        },
        "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true]),
        "sampleImage": *[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true][0] {
          "thumbnailUrl": thumbnailImage.asset->url,
          "imageUrl": webpImage.asset->url
        }
      }
    }
  `, { categorySlug });
}

// Hent alle underkategorier for en kategori
export async function getSubcategoriesByCategory(categorySlug: string) {
  return client.fetch(`
    *[_type == "subcategory" && parentCategory->slug.current == $categorySlug && isActive == true]
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
      "imageUrl": featuredImage.asset->url,
      "parentCategory": parentCategory->{ title, "slug": slug.current },
      "drawingCount": count(*[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true])
    }
  `, { categorySlug });
}

// Hent en spesifikk underkategori med tegninger
export async function getSubcategoryWithDrawings(categorySlug: string, subcategorySlug: string) {
  return client.fetch(`
    *[_type == "subcategory" && slug.current == $subcategorySlug && parentCategory->slug.current == $categorySlug && isActive == true][0] {
      _id,
      title,
      description,
      difficulty,
      "slug": slug.current,
      "imageUrl": featuredImage.asset->url,
      "parentCategory": parentCategory->{ title, "slug": slug.current },
      "drawings": *[_type == "drawingImage" && subcategory._ref == ^._id && isActive == true] | order(order asc, _createdAt desc) {
        _id,
        title,
        description,
        "imageUrl": coalesce(displayImage.asset->url, webpImage.asset->url),
        "thumbnailUrl": coalesce(thumbnailImage.asset->url, displayImage.asset->url, webpImage.asset->url),
        "downloadUrl": downloadFile.asset->url,
        difficulty,
        hasDigitalColoring,
        publishedDate,
        _createdAt,
        tags,
        "slug": slug.current
      }
    }
  `, { categorySlug, subcategorySlug });
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
export async function getDrawingsBySubcategory(subcategorySlug: string) {
  return client.fetch(`
    *[_type == "drawingImage" && subcategory->slug.current == $subcategorySlug] {
      _id,
      title,
      "slug": slug.current,
      "imageUrl": webpImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      tags,
      order,
      isActive
    } | order(order asc, title asc)
  `, { subcategorySlug })
}

// Hent alle bilder som kan fargelegges (for static paths)
export async function getAllColoringImages() {
  return client.fetch(`
    *[_type == "drawingImage" && isActive == true] {
      _id
    }
  `)
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