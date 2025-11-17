import dotenv from 'dotenv';
import { getSanityClient } from './sanity-client';

dotenv.config();

async function count() {
  const client = getSanityClient();
  const count = await client.fetch('count(*[_type == "drawingImage" && language == "sv"])');
  console.log('Total Swedish drawings:', count);
}

count();
