import type { PortableTextBlock } from '@portabletext/types';

// Centralized type for a single coloring page drawing
export interface Drawing {
  _id: string;
  title: string;
  description?: string;
  metaDescription?: string;
  imageUrl?: string;
  imageLqip?: string;
  imageAlt?: string;
  fallbackImageUrl?: string;
  fallbackImageLqip?: string;
  thumbnailUrl?: string;
  thumbnailLqip?: string;
  thumbnailAlt?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  recommendedAgeRange?: string;
  contextContent?: PortableTextBlock[];
  slug?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  publishedDate?: string;
  _createdAt?: string;
}

// Type for the parent category (e.g., "Dyr", "Kjøretøy")
export interface ParentCategory {
  title: string;
  slug: string;
}

// Type for a subcategory (e.g., "Hunder", "Katter")
export interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  parentCategory?: ParentCategory;
  drawings?: Drawing[];
}

export interface SitemapPost {
  slug: string;
  _updatedAt: string;
}

export interface SitemapCategory {
  slug: string;
  _updatedAt: string;
}

export interface SitemapSubcategory {
  slug: string;
  parentCategorySlug: string;
  _updatedAt: string;
}

export interface SitemapDrawing {
  slug: string;
  subcategorySlug: string;
  parentCategorySlug: string;
  _updatedAt: string;
}

export interface SitemapPageData {
  posts: SitemapPost[];
  categories: SitemapCategory[];
  subcategories: SitemapSubcategory[];
  drawings: SitemapDrawing[];
}

// You can add other shared types below if needed 