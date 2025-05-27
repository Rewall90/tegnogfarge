import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

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
export const urlFor = (source: any) => {
  return builder.image(source);
};

// Hjelpefunksjon for å hente alle bilder i en kategori
export async function getImagesInCategory(category: string, page = 1, limit = 30) {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return client.fetch(`
    *[_type == "drawingImage" && category._ref == $category] {
      _id,
      title,
      description,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      canColorOnline
    }[$start...$end]
  `, { category, start, end });
}

// Hjelpefunksjon for å hente alle kategorier
export async function getAllCategories() {
  return client.fetch(`
    *[_type == "category"] {
      _id,
      title,
      "slug": slug.current,
      description,
      "imageUrl": image.asset->url
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
    *[_type == "drawingImage" && _id == $id][0] {
      _id,
      title,
      description,
      svgContent,
      hasDigitalColoring,
      suggestedColors,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      "category": category->{ 
        title, 
        "slug": slug.current 
      },
      tags,
      difficulty,
      _createdAt,
      _updatedAt
    }
  `, { id })
}

// Hent bilder i kategori med fargelegging-info (oppdatert versjon)
export async function getCategoryImagesWithColoring(categorySlug: string) {
  return client.fetch(`
    *[_type == "drawingImage" && category->slug.current == $categorySlug] {
      _id,
      title,
      description,
      "imageUrl": mainImage.asset->url,
      "downloadUrl": downloadFile.asset->url,
      hasDigitalColoring,
      difficulty,
      "slug": slug.current
    } | order(_createdAt desc)
  `, { categorySlug })
}

// Hent alle bilder som kan fargelegges (for static paths)
export async function getAllColoringImages() {
  return client.fetch(`
    *[_type == "drawingImage" && hasDigitalColoring == true] {
      _id,
      "slug": slug.current
    }
  `)
}

// Admin-funksjon: Valider alle fargeleggingsbilder
export async function validateAllColoringImages() {
  const images = await client.fetch(`
    *[_type == "drawingImage" && hasDigitalColoring == true] {
      _id,
      title,
      svgContent
    }
  `)
  
  if (typeof window === 'undefined') {
    // Server-side: returnerer bare grunnleggende info
    return images.map((image: any) => ({
      id: image._id,
      title: image.title,
      hasSvg: !!image.svgContent,
      validation: null
    }))
  }
  
  // Client-side: full validering
  const { validateSVGForColoring } = await import('./svg-sanitizer')
  
  return images.map((image: any) => {
    try {
      const validation = validateSVGForColoring(image.svgContent || '')
      return {
        id: image._id,
        title: image.title,
        validation
      }
    } catch (error) {
      return {
        id: image._id,
        title: image.title,
        validation: {
          isValid: false,
          hasColorableAreas: false,
          colorableAreasCount: 0,
          warnings: ['Validering feilet']
        }
      }
    }
  })
} 