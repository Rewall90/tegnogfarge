import { ObjectId } from 'mongodb';

export interface Drawing {
  _id?: ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  categoryId: ObjectId;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
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
    imageUrl: data.imageUrl,
    categoryId: data.categoryId,
    difficulty: data.difficulty,
    tags: data.tags || [],
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    isPublished: data.isPublished ?? true,
    authorId: data.authorId,
    downloadCount: data.downloadCount ?? 0,
  };
} 