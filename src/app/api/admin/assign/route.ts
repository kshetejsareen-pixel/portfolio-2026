import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: Request) {
  const { publicId, slotId } = await req.json()

  if (!publicId || !slotId) {
    return NextResponse.json({ error: 'publicId and slotId required' }, { status: 400 })
  }

  try {
    // Remove this slot from any image that currently holds it
    const existing = await cloudinary.search
      .expression(`resource_type:image AND context.portfolio_slot="${slotId}"`)
      .with_field('context')
      .max_results(10)
      .execute()

    for (const img of existing.resources) {
      if (img.public_id !== publicId) {
        await cloudinary.uploader.explicit(img.public_id, {
          type: 'upload',
          context: 'portfolio_slot=',
        })
      }
    }

    // Assign the new image
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: `portfolio_slot=${slotId}`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Assign error:', err)
    return NextResponse.json({ error: 'Failed to assign' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { publicId } = await req.json()

  if (!publicId) {
    return NextResponse.json({ error: 'publicId required' }, { status: 400 })
  }

  try {
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      context: 'portfolio_slot=',
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Unassign error:', err)
    return NextResponse.json({ error: 'Failed to unassign' }, { status: 500 })
  }
}
