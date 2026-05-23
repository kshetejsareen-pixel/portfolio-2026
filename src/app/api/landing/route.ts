import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { readLandingConfig } from '@/lib/landingConfig'

// Public endpoint — returns frame config + image assignments for the landing page
export async function GET() {
  const [config, searchResult] = await Promise.all([
    readLandingConfig(),
    cloudinary.search
      .expression('resource_type:image AND context.portfolio_slot:landing-*')
      .with_field('context')
      .max_results(200)
      .execute()
      .catch(() => ({ resources: [] })),
  ])

  const assignments: Record<string, string> = {}
  for (const img of searchResult.resources) {
    const slotId = img.context?.custom?.portfolio_slot
    if (slotId) {
      assignments[slotId] = cloudinary.url(img.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
        width: 2400,
      })
    }
  }

  return NextResponse.json({ config, assignments }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
