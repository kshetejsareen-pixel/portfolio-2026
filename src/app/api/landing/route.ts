import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { readLandingConfig } from '@/lib/landingConfig'

// Public endpoint — returns frame config + image assignments (with copy) for the landing page.
// Cloudinary doesn't support wildcard context searches, so we fetch all images with context
// and filter for landing-* slots on the server.
export async function GET() {
  const [config, searchResult] = await Promise.all([
    readLandingConfig(),
    cloudinary.search
      .expression('resource_type:image')
      .with_field('context')
      .max_results(500)
      .execute()
      .catch(() => ({ resources: [] })),
  ])

  const assignments: Record<string, {
    url: string
    title: string
    location: string
    year: string
    camera: string
  }> = {}

  for (const img of searchResult.resources) {
    const slotId = img.context?.custom?.portfolio_slot
    if (!slotId?.startsWith('landing-')) continue
    const ctx = img.context?.custom ?? {}
    assignments[slotId] = {
      url:      cloudinary.url(img.public_id, { fetch_format: 'auto', quality: 'auto', width: 2400 }),
      title:    ctx.ks_title    ?? '',
      location: ctx.ks_location ?? '',
      year:     ctx.ks_year     ?? '',
      camera:   ctx.ks_camera   ?? '',
    }
  }

  return NextResponse.json({ config, assignments }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
