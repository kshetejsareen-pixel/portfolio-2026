import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { setAssignment, removeAssignment, removeAssignmentByPublicId, swapAssignments, getAllAssignments, updateFocalPoint, updateTransform } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function desktopUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_2400/${publicId}`
}

function mobileUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_2400/${publicId}`
}

export async function POST(req: Request) {
  const { publicId, slotId, title = '', location = '', year = '', camera = '' } = await req.json()

  if (!publicId || !slotId) {
    return NextResponse.json({ error: 'publicId and slotId required' }, { status: 400 })
  }

  try {
    // Sync portfolio_slot context tags on Cloudinary images (best-effort — store is authoritative)
    cloudinary.search
      .expression(`resource_type:image AND context.portfolio_slot:${slotId}`)
      .with_field('context')
      .max_results(10)
      .execute()
      .then((existing) => {
        for (const img of existing.resources) {
          if (img.public_id !== publicId) {
            cloudinary.uploader.explicit(img.public_id, { type: 'upload', context: 'portfolio_slot=' }).catch(() => {})
          }
        }
        cloudinary.uploader.explicit(publicId, { type: 'upload', context: `portfolio_slot=${slotId}` }).catch(() => {})
      })
      .catch(() => {})

    // Fetch existing metadata + dimensions (best-effort — falls back to caller-supplied values)
    let resolvedTitle = title, resolvedLocation = location, resolvedYear = year, resolvedCamera = camera
    let width: number | undefined, height: number | undefined
    try {
      const meta = await cloudinary.api.resource(publicId, { image_metadata: false })
      const ctx = meta.context?.custom ?? {}
      resolvedTitle    = ctx.ks_title    ?? title
      resolvedLocation = ctx.ks_location ?? location
      resolvedYear     = ctx.ks_year     ?? year
      resolvedCamera   = ctx.ks_camera   ?? camera
      if (meta.width)  width  = meta.width
      if (meta.height) height = meta.height
    } catch { /* use defaults */ }

    // Write to store — this is the authoritative assignment record
    await setAssignment(slotId, {
      publicId,
      url:       desktopUrl(publicId),
      mobileUrl: mobileUrl(publicId),
      title:     resolvedTitle,
      location:  resolvedLocation,
      year:      resolvedYear,
      camera:    resolvedCamera,
      width,
      height,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Assign error:', err)
    return NextResponse.json({ error: 'Failed to assign' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { slotA, slotB } = await req.json()
  if (!slotA || !slotB) {
    return NextResponse.json({ error: 'slotA and slotB required' }, { status: 400 })
  }

  try {
    // Read before swap so we know which publicId goes to which slot after
    const before = await getAllAssignments()
    const valA = before[slotA]
    const valB = before[slotB]

    await swapAssignments(slotA, slotB)

    // Update Cloudinary portfolio_slot context (fire-and-forget — store is authoritative)
    if (valA) cloudinary.uploader.explicit(valA.publicId, { type: 'upload', context: `portfolio_slot=${slotB}` }).catch(() => {})
    if (valB) cloudinary.uploader.explicit(valB.publicId, { type: 'upload', context: `portfolio_slot=${slotA}` }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Swap error:', err)
    return NextResponse.json({ error: 'Failed to swap' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { slotId } = body

  if (!slotId) {
    return NextResponse.json({ error: 'slotId required' }, { status: 400 })
  }

  try {
    if (body.type === 'transform') {
      const angle = (body.angle ?? 0) as 0 | 90 | 180 | 270
      const flipH = body.flipH ?? false
      const flipV = body.flipV ?? false
      await updateTransform(slotId, angle, flipH, flipV)
      return NextResponse.json({ ok: true })
    }

    // focal point
    const { focalX, focalY } = body
    if (focalX == null || focalY == null) {
      return NextResponse.json({ error: 'focalX, focalY required' }, { status: 400 })
    }
    await updateFocalPoint(slotId, focalX, focalY)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PUT error:', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { publicId, slotId } = await req.json()

  if (!slotId && !publicId) {
    return NextResponse.json({ error: 'slotId required' }, { status: 400 })
  }

  try {
    // Best-effort tag clear on Cloudinary (non-fatal)
    if (publicId) {
      cloudinary.uploader.explicit(publicId, { type: 'upload', context: 'portfolio_slot=' }).catch(() => {})
    }

    // Remove only this specific slot — do NOT wipe the same image from other slots
    // (e.g. a gallery delete must not also clear a matching landing-page slot)
    if (slotId) {
      await removeAssignment(slotId)
    } else {
      await removeAssignmentByPublicId(publicId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Unassign error:', err)
    return NextResponse.json({ error: 'Failed to unassign' }, { status: 500 })
  }
}
