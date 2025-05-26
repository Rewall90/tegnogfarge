import { ObjectId } from 'mongodb';

export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  order?: number;
}

export function mapToCategoryModel(data: any): Category {
  return {
    _id: data._id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    imageUrl: data.imageUrl,
    isActive: data.isActive ?? true,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    order: data.order,
  };
} 