import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder')

  if (!folder) {
    return NextResponse.json({ error: 'folder required' }, { status: 400 })
  }

  try {
    const result = await cloudinary.search
      .expression(`folder="${folder}" AND resource_type:image`)
      .sort_by('created_at', 'asc')
      .max_results(500)
      .execute()

    return NextResponse.json(
      { images: result.resources },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    console.error('project-images error:', err)
    return NextResponse.json({ images: [] })
  }
}
