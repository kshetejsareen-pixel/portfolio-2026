import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'projects-config.json')
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function coverUrl(coverId: string | undefined) {
  if (!coverId) return null
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_600,h_400,c_fill,q_auto,f_auto/${coverId}`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const catId = searchParams.get('catId')

  let config: Record<string, object[]>
  try {
    config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'))
  } catch {
    config = {}
  }

  const enrich = (arr: object[]) =>
    arr.map((p: object) => ({
      ...p,
      coverUrl: coverUrl((p as Record<string, string>).coverId),
    }))

  if (catId) {
    return NextResponse.json({ projects: enrich(config[catId] ?? []) }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const all: Record<string, object[]> = {}
  for (const [id, arr] of Object.entries(config)) {
    all[id] = enrich(arr)
  }
  return NextResponse.json({ projects: all }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
