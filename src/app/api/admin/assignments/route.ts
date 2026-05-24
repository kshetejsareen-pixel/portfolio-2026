import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

// Returns a map of slotId → { publicId, url, thumbnailUrl }
// Cloudinary doesn't support wildcard context searches (context.key:*),
// so we fetch all images with context and filter on the server.
export async function GET() {
  try {
    const result = await cloudinary.search
      .expression('resource_type:image')
      .with_field('context')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute()

    const assignments: Record<string, { publicId: string; url: string; thumbnailUrl: string }> = {}

    for (const img of result.resources) {
      const slotId = img.context?.custom?.portfolio_slot
      if (!slotId) continue
      assignments[slotId] = {
        publicId: img.public_id,
        url: img.secure_url,
        thumbnailUrl: cloudinary.url(img.public_id, {
          width: 400,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        }),
      }
    }

    return NextResponse.json({ assignments })
  } catch (err) {
    console.error('Assignments fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}
