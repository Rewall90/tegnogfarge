export interface Drawing {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  metaDescription?: string;
  recommendedAgeRange?: string;
  imageUrl?: string;
  imageAlt?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  contextContent?: any; // Portable Text format
  categorySlug?: string;
  subcategorySlug?: string;
  image?: {
    url?: string;
    alt?: string;
  };
} 