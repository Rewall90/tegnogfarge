import imageUrlBuilder from '@sanity/image-url';
import { client } from './sanity';

const builder = imageUrlBuilder(client);

export function urlForImage(source: unknown) {
  return source ? builder.image(source).url() : '/placeholder.jpg';
} 