import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor     = searchParams.get('cursor') || undefined
  const search     = searchParams.get('q') || ''
  const folder     = searchParams.get('folder') || ''
  const fetchAll   = searchParams.get('all') === 'true'
  const maxResults = fetchAll ? 500 : 40

  try {
    let expression: string
    if (folder) {
      expression = `folder="${folder}" AND resource_type:image`
    } else if (search) {
      expression = `resource_type:image AND ${search}`
    } else {
      expression = 'resource_type:image'
    }

    const query = cloudinary.search
      .expression(expression)
      .with_field('context')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(maxResults)

    if (!fetchAll && cursor) query.next_cursor(cursor)

    const result = await query.execute()

    return NextResponse.json({
      images:      result.resources,
      next_cursor: fetchAll ? null : (result.next_cursor ?? null),
    })
  } catch (err) {
    console.error('Cloudinary list error:', err)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}
