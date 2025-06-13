import { ObjectId } from 'mongodb';

export interface Drawing {
  _id?: ObjectId;
  title: string;
  description: string;
  metaDescription?: string;
  imageUrl: string;
  categoryId: ObjectId;
  difficulty: 'easy' | 'medium' | 'hard';
  recommendedAgeRange?: string;
  contextContent?: any; // Portable Text content
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  authorId?: ObjectId;
  downloadCount: number;
}

export interface DrawingWithCategory extends Drawing {
  category: {
    _id: ObjectId;
    name: string;
    slug: string;
  };
}

export function mapToDrawingModel(data: any): Drawing {
  return {
    _id: data._id,
    title: data.title,
    description: data.description,
    metaDescription: data.metaDescription,
    imageUrl: data.imageUrl,
    categoryId: data.categoryId,
    difficulty: data.difficulty,
    recommendedAgeRange: data.recommendedAgeRange || 'all',
    contextContent: data.contextContent,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    isPublished: data.isPublished ?? true,
    authorId: data.authorId,
    downloadCount: data.downloadCount ?? 0,
  };
} 