import { createClient } from 'next-sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION

// En enkel klient-konfigurasjon som er trygg å bruke i klient-komponenter
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // CDN er vanligvis ikke ønsket for sanntids forhåndsvisning
}) 