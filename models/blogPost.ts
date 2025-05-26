import { ObjectId } from 'mongodb';

export interface BlogPost {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: ObjectId;
  imageUrl?: string;
  tags?: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface BlogPostWithAuthor extends BlogPost {
  author: {
    _id: ObjectId;
    name: string;
    image?: string;
  };
}

export function mapToBlogPostModel(data: any): BlogPost {
  return {
    _id: data._id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt || '',
    authorId: data.authorId,
    imageUrl: data.imageUrl,
    tags: data.tags || [],
    published: data.published ?? false,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
  };
} 