import { NextResponse } from 'next/server'
import { firestoreRead } from '@/lib/firestoreStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'
const DOC_ID = 'ks-projects-config'

interface StoredProject {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  coverId?: string
  imageCount?: number
  tags?: string[]
  hiddenImages?: string[]
}

function coverUrl(coverId: string | undefined) {
  if (!coverId) return null
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_600,h_400,c_fill,q_auto,f_auto/${coverId}`
}

function enrich(projects: StoredProject[]) {
  return projects.map((p) => ({ ...p, coverUrl: coverUrl(p.coverId) }))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const catId = searchParams.get('catId')

  const config = await firestoreRead<Record<string, StoredProject[]>>(DOC_ID, {})

  if (catId) {
    return NextResponse.json(
      { projects: enrich(config[catId] ?? []) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const all: Record<string, ReturnType<typeof enrich>> = {}
  for (const [id, arr] of Object.entries(config)) {
    all[id] = enrich(arr)
  }
  return NextResponse.json({ projects: all }, { headers: { 'Cache-Control': 'no-store' } })
}
