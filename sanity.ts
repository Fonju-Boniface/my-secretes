/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId } from './sanity/env';

// Configuration for the Sanity client
export const sanityClient = createClient({
  projectId,    // From your `sanity/env.ts`
  dataset,      // From your `sanity/env.ts`
  apiVersion,   // From your `sanity/env.ts`
  useCdn: true, // `true` for faster responses with cached data
});

// For generating image URLs from Sanity image assets
const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: any) => builder.image(source);
