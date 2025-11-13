/**
 * TypeScript types for translation script
 */

// Sanity document types
export interface SanityDocument {
  _id: string;
  _type: string;
  _rev: string;
  language?: string;
  baseDocumentId?: string; // Links translated documents back to their Norwegian original
}

export interface CategoryDocument extends SanityDocument {
  _type: 'category';
  title: string;
  slug: { current: string };
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  image?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  icon?: string;
  order?: number;
  isActive?: boolean;
  featured?: boolean;
}

export interface SubcategoryDocument extends SanityDocument {
  _type: 'subcategory';
  title: string;
  slug: { current: string };
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  parentCategory: {
    _type: 'reference';
    _ref: string;
  };
  difficulty?: number;
  order?: number;
  isActive?: boolean;
}

export interface DrawingDocument extends SanityDocument {
  _type: 'drawingImage';
  title: string;
  slug: { current: string };
  description?: string;
  metaDescription?: string;
  contextContent?: any[]; // Portable text blocks
  displayImage?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  thumbnailImage?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  webpImage?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  subcategory: {
    _type: 'reference';
    _ref: string;
  };
  recommendedAgeRange?: string;
  difficulty?: string;
  order?: number;
  isActive?: boolean;
}

// Translation types
export interface TranslationConfig {
  sourceLanguage: string;
  targetLanguage: string;
  dryRun: boolean;
  limit?: number;
  documentTypes: ('category' | 'subcategory' | 'drawingImage')[];
}

export interface TranslatableFields {
  title?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaDescription?: string;
  contextContent?: any[];
  imageAlt?: string;
  displayImageAlt?: string;
  thumbnailImageAlt?: string;
  webpImageAlt?: string;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
}

export interface TranslationResult {
  success: boolean;
  documentId: string;
  documentType: string;
  translatedId?: string;
  error?: string;
}

export interface TranslationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  startTime: Date;
  endTime?: Date;
}

export type DocumentType = 'category' | 'subcategory' | 'drawingImage';
