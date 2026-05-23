import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor    = searchParams.get('cursor') || undefined
  const search    = searchParams.get('q') || ''
  const maxResults = 40

  try {
    let result

    if (search) {
      result = await cloudinary.search
        .expression(`resource_type:image AND ${search}`)
        .with_field('context')
        .with_field('tags')
        .sort_by('created_at', 'desc')
        .max_results(maxResults)
        .next_cursor(cursor as string)
        .execute()
    } else {
      result = await cloudinary.search
        .expression('resource_type:image')
        .with_field('context')
        .with_field('tags')
        .sort_by('created_at', 'desc')
        .max_results(maxResults)
        .next_cursor(cursor as string)
        .execute()
    }

    return NextResponse.json({
      images: result.resources,
      next_cursor: result.next_cursor ?? null,
    })
  } catch (err) {
    console.error('Cloudinary list error:', err)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}
