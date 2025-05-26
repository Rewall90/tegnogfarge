import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string; // This would be hashed in the database
  image?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date;
  favoriteIds?: ObjectId[];
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin';
  createdAt: string;
  emailVerified?: string;
}

export function mapToUserModel(data: any): User {
  return {
    _id: data._id,
    name: data.name,
    email: data.email,
    password: data.password,
    image: data.image,
    role: data.role || 'user',
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    emailVerified: data.emailVerified ? new Date(data.emailVerified) : undefined,
    favoriteIds: data.favoriteIds || [],
  };
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user._id?.toString() || '',
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString(),
  };
} 