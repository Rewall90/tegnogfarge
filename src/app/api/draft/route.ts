import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { client } from '@/lib/sanity'
import { SANITY_DRAFT_MODE_SECRET } from '@/lib/sanity.secrets'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') || '/'
  
  // Validere secret token
  if (secret !== SANITY_DRAFT_MODE_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Aktivere draft mode
  draftMode().enable()
  
  // Redirect til den forespurte siden
  redirect(slug)
} 