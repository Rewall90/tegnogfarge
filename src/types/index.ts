import type { PortableTextBlock } from '@portabletext/types';

// Centralized type for a single coloring page drawing
export interface Drawing {
  _id: string;
  title: string;
  description?: string;
  metaDescription?: string;
  imageUrl?: string;
  imageLqip?: string;
  fallbackImageUrl?: string;
  fallbackImageLqip?: string;
  thumbnailUrl?: string;
  thumbnailLqip?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  recommendedAgeRange?: string;
  contextContent?: PortableTextBlock[];
  slug?: string;
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

// You can add other shared types below if needed 