import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { client } from '@/lib/sanity'
import type { Session } from 'next-auth'

interface ColoredRegion {
  regionId: string
  color: string
}

interface SaveRequest {
  drawingId: string
  coloredRegions: ColoredRegion[]
  timestamp: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { drawingId, coloredRegions, timestamp } = await request.json() as SaveRequest

    if (!drawingId || !coloredRegions || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update the document in Sanity
    await client
      .patch(drawingId)
      .set({
        coloredRegions,
        lastModified: timestamp,
        lastModifiedBy: session.user.id,
      })
      .commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving coloring:', error)
    return NextResponse.json(
      { error: 'Failed to save coloring' },
      { status: 500 }
    )
  }
} 