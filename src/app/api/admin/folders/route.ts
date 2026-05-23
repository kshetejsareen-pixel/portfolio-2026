import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''

  try {
    // List folders at the given path (root if empty)
    const result = path
      ? await cloudinary.api.sub_folders(path)
      : await cloudinary.api.root_folders()

    // Also get image count for each folder
    const folders = await Promise.all(
      result.folders.map(async (f: { name: string; path: string }) => {
        const count = await cloudinary.search
          .expression(`folder="${f.path}" AND resource_type:image`)
          .max_results(1)
          .execute()
          .then((r) => r.total_count)
          .catch(() => 0)
        return { name: f.name, path: f.path, imageCount: count }
      })
    )

    return NextResponse.json({ folders })
  } catch (err) {
    console.error('Folders list error:', err)
    return NextResponse.json({ folders: [] })
  }
}
