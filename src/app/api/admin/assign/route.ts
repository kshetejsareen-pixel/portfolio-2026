import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { setAssignment, removeAssignmentByPublicId, swapAssignments, getAllAssignments } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function desktopUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_2400/${publicId}`
}

function mobileUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_900,ar_9:16,c_fill,g_auto/${publicId}`
}

export async function POST(req: Request) {
  const { publicId, slotId, title = '', location = '', year = '', camera = '' } = await req.json()

  if (!publicId || !slotId) {
    return NextResponse.json({ error: 'publicId and slotId required' }, { status: 400 })
  }

  try {
    // Remove this slot from any image that currently holds it in Cloudinary
    const existing = await cloudinary.search
      .expression(`resource_type:image AND context.portfolio_slot:${slotId}`)
      .with_field('context')
      .max_results(10)
      .execute()
      .catch(() => ({ resources: [] }))

    for (const img of existing.resources) {
      if (img.public_id !== publicId) {
        await cloudinary.uploader.explicit(img.public_id, {
          type: 'upload',
          context: 'portfolio_slot=',
        })
      }
    }

    // Assign the new image to this slot in Cloudinary
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: `portfolio_slot=${slotId}`,
    })

    // Fetch existing metadata so the store is fully populated (don't rely on caller passing copy)
    let resolvedTitle = title, resolvedLocation = location, resolvedYear = year, resolvedCamera = camera
    try {
      const meta = await cloudinary.api.resource(publicId, { image_metadata: false })
      const ctx = meta.context?.custom ?? {}
      resolvedTitle    = ctx.ks_title    ?? title
      resolvedLocation = ctx.ks_location ?? location
      resolvedYear     = ctx.ks_year     ?? year
      resolvedCamera   = ctx.ks_camera   ?? camera
    } catch { /* use defaults */ }

    // Write to Cloudinary store so public APIs don't rely on search indexing lag
    await setAssignment(slotId, {
      publicId,
      url:      desktopUrl(publicId),
      mobileUrl: mobileUrl(publicId),
      title:    resolvedTitle,
      location: resolvedLocation,
      year:     resolvedYear,
      camera:   resolvedCamera,
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

export async function DELETE(req: Request) {
  const { publicId, slotId } = await req.json()

  if (!publicId) {
    return NextResponse.json({ error: 'publicId required' }, { status: 400 })
  }

  try {
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: 'portfolio_slot=',
    })

    // Remove from Cloudinary store
    await removeAssignmentByPublicId(publicId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Unassign error:', err)
    return NextResponse.json({ error: 'Failed to unassign' }, { status: 500 })
  }
}
