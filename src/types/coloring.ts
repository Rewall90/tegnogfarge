export interface CategoryType {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
}

export interface SubcategoryType {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  parentCategory?: CategoryType;
  drawings?: DrawingType[];
}

export interface DrawingType {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  image?: any;
  subcategory?: SubcategoryType;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostType {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: any;
  excerpt?: string;
  body?: any;
  publishedAt?: string;
  categories?: CategoryType[];
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin';
}

export interface FavoriteType {
  _id: string;
  userId: string;
  drawingId: string;
  drawing?: DrawingType;
  createdAt: string;
} 