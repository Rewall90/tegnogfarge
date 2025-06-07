export interface Drawing {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  downloadUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hasDigitalColoring?: boolean;
  tags?: string[];
  categorySlug?: string;
  subcategorySlug?: string;
  image?: {
    url?: string;
    alt?: string;
  };
} 