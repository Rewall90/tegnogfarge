export interface Drawing {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  date?: string;
  [key: string]: any;
}

export interface Subcategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  drawings: Drawing[];
  [key: string]: any;
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  subcategories: Subcategory[];
  [key: string]: any;
} 