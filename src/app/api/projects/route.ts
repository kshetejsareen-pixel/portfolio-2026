import { NextResponse } from 'next/server'
import { enrichProjects, getProjectsByCategory, type EnrichedProject } from '@/lib/projects'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const catId = searchParams.get('catId')

  const config = await getProjectsByCategory()

  if (catId) {
    return NextResponse.json(
      { projects: enrichProjects(config[catId] ?? []) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const all: Record<string, EnrichedProject[]> = {}
  for (const [id, arr] of Object.entries(config)) {
    all[id] = enrichProjects(arr)
  }
  return NextResponse.json({ projects: all }, { headers: { 'Cache-Control': 'no-store' } })
}
