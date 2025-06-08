'use client'

import { useLiveMode } from '@sanity/react-loader'
import { VisualEditing as SanityVisualEditing } from 'next-sanity'
import { client } from '@/lib/sanity.client'

export function VisualEditing() {
  useLiveMode({ client })

  return <SanityVisualEditing />
} 