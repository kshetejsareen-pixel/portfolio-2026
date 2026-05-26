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

    const folders = result.folders.map((f: { name: string; path: string }) => ({
      name: f.name,
      path: f.path,
      imageCount: 0,
    }))

    return NextResponse.json({ folders })
  } catch (err) {
    console.error('Folders list error:', err)
    return NextResponse.json({ folders: [] })
  }
}
