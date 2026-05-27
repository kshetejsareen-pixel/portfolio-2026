import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { updateCopyByPublicId } from '@/lib/assignmentsStore'

// Standardized copy fields stored in Cloudinary context:
//   ks_title    — main subject/title
//   ks_location — venue or city
//   ks_year     — 4-digit year
//   ks_camera   — body · focal length (optional)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const publicId = searchParams.get('publicId')
  if (!publicId) return NextResponse.json({ error: 'publicId required' }, { status: 400 })

  try {
    const result = await cloudinary.api.resource(publicId, { image_metadata: false })
    const ctx = result.context?.custom ?? {}
    return NextResponse.json({
      title:    ctx.ks_title    ?? '',
      location: ctx.ks_location ?? '',
      year:     ctx.ks_year     ?? '',
      camera:   ctx.ks_camera   ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PATCH(req: Request) {
  const { publicId, title, location, year, camera } = await req.json()
  if (!publicId) return NextResponse.json({ error: 'publicId required' }, { status: 400 })

  const contextParts: string[] = []
  if (title    !== undefined) contextParts.push(`ks_title=${title}`)
  if (location !== undefined) contextParts.push(`ks_location=${location}`)
  if (year     !== undefined) contextParts.push(`ks_year=${year}`)
  if (camera   !== undefined) contextParts.push(`ks_camera=${camera}`)

  if (contextParts.length === 0) return NextResponse.json({ ok: true })

  try {
    // Firestore is authoritative — update it first so the website reflects changes immediately
    await updateCopyByPublicId(publicId, {
      ...(title    !== undefined && { title }),
      ...(location !== undefined && { location }),
      ...(year     !== undefined && { year }),
      ...(camera   !== undefined && { camera }),
    })

    // Sync Cloudinary context tags (fire-and-forget — not critical for the website)
    cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: contextParts.join('|'),
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('image-meta PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
