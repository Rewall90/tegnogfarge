'use client'

import dynamic from 'next/dynamic'

// Dynamisk import for å sikre at koden kun lastes når komponenten brukes
const SanityVisualEditing = dynamic(
  () => import('next-sanity').then((mod) => mod.VisualEditing),
  {
    ssr: false,
    loading: () => null,
  }
)

export function VisualEditing() {
  return <SanityVisualEditing />
} 