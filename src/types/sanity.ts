export interface SanityPost {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage: {
    asset: {
      _ref: string;
      url: string; 
    };
  };
  body: any[]; 
  author: {
    name: string;
  };
  categories: {
    title: string;
  }[];
  publishedAt: string;
} 