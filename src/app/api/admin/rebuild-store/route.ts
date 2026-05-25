import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { firestoreWrite } from '@/lib/firestoreStore'
import { getAllAssignments, type StoredAssignment } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function buildUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_2400/${publicId}`
}

// POST /api/admin/rebuild-store
// Rebuilds the ks-assignments store by searching Cloudinary for all images
// that have a portfolio_slot context tag. Merges with any existing store data
// so no currently-stored assignments are lost.
export async function POST() {
  try {
    // Start with whatever is currently in the store
    const existing = await getAllAssignments()
    const store: Record<string, StoredAssignment> = { ...existing }

    // Search for all images tagged with a portfolio_slot
    let nextCursor: string | undefined
    let total = 0

    do {
      const query = cloudinary.search
        .expression('resource_type:image AND context.portfolio_slot=*')
        .with_field('context')
        .max_results(100)

      if (nextCursor) query.next_cursor(nextCursor)

      const result = await query.execute()
      nextCursor = result.next_cursor

      for (const img of result.resources) {
        const slot = img.context?.custom?.portfolio_slot
        if (!slot) continue

        const ctx = img.context?.custom ?? {}
        // Only add if not already in store (don't clobber existing focalX/Y/transforms)
        if (!store[slot]) {
          store[slot] = {
            publicId:  img.public_id,
            url:       buildUrl(img.public_id),
            mobileUrl: buildUrl(img.public_id),
            title:     ctx.ks_title    ?? '',
            location:  ctx.ks_location ?? '',
            year:      ctx.ks_year     ?? '',
            camera:    ctx.ks_camera   ?? '',
          }
        }
        total++
      }
    } while (nextCursor)

    await firestoreWrite('ks-assignments', store)

    return NextResponse.json({
      ok: true,
      restored: Object.keys(store).length,
      fromCloudinary: total,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Rebuild store error:', err)
    // Surface rate-limit message clearly
    if (msg.includes('Rate Limit')) {
      return NextResponse.json({ error: 'Still rate-limited. Try again later.', detail: msg }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to rebuild store', detail: msg }, { status: 500 })
  }
}
