import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { client } from '@/lib/sanity'
import { SANITY_DRAFT_MODE_SECRET } from '@/lib/sanity.secrets'

// Denne funksjonen bygger den korrekte URL-stien basert på dokumentet fra Sanity
async function resolveUrl(doc: { _type: string, slug?: { current: string }, subcategory?: any }): Promise<string> {
  if (!doc.slug?.current) {
    return '/'
  }

  switch (doc._type) {
    case 'post':
      return `/blog/${doc.slug.current}`
    case 'drawingImage': {
      // For tegninger må vi hente kategori-slug for å bygge hele stien
      const parentData = await client.fetch(
        `*[_type == "drawingImage" && slug.current == $slug][0]{
          "categorySlug": subcategory->parentCategory->slug.current,
          "subcategorySlug": subcategory->slug.current
        }`,
        { slug: doc.slug.current }
      )
      if (parentData.categorySlug && parentData.subcategorySlug) {
        return `/${parentData.categorySlug}/${parentData.subcategorySlug}/${doc.slug.current}`
      }
      return '/'
    }
    default:
      return `/${doc.slug.current}`
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') // Sanity legger automatisk til slug

  if (secret !== SANITY_DRAFT_MODE_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  if (!slug) {
    return new Response('Slug not found', { status: 404 })
  }

  // Hent dokumentet for å finne typen og validere slug
  const doc = await client.fetch<({ _type: string, slug?: { current: string } })>(
    `*[_type in ["post", "drawingImage"] && slug.current == $slug][0]`,
    { slug }
  );

  if (!doc) {
    return new Response('Invalid slug', { status: 401 })
  }

  const redirectUrl = await resolveUrl(doc);

  draftMode().enable()

  redirect(redirectUrl)
} 