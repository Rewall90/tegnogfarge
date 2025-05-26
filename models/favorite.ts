import { ObjectId } from 'mongodb';

export interface Favorite {
  _id?: ObjectId;
  userId: ObjectId;
  drawingId: ObjectId;
  createdAt: Date;
}

export interface FavoriteWithDrawing extends Favorite {
  drawing: {
    _id: ObjectId;
    title: string;
    imageUrl: string;
    description: string;
    categoryId: ObjectId;
  };
}

export function mapToFavoriteModel(data: any): Favorite {
  return {
    _id: data._id,
    userId: data.userId,
    drawingId: data.drawingId,
    createdAt: new Date(data.createdAt),
  };
} 