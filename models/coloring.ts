import { ObjectId } from 'mongodb';

export interface Coloring {
  _id?: ObjectId;
  userId: ObjectId;
  drawingId: ObjectId;
  imageUrl: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  likes?: number;
}

export interface ColoringWithDrawing extends Coloring {
  drawing: {
    _id: ObjectId;
    title: string;
    imageUrl: string;
  };
}

export function mapToColoringModel(data: any): Coloring {
  return {
    _id: data._id,
    userId: data.userId,
    drawingId: data.drawingId,
    imageUrl: data.imageUrl,
    name: data.name || 'Untitled',
    isPublic: data.isPublic ?? false,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    tags: data.tags || [],
    likes: data.likes || 0,
  };
} 