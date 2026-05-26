import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

const PUBLIC_ID = 'ks-projects-config'

export interface AdminProject {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  coverId?: string
  coverFocalX?: number
  coverFocalY?: number
  imageCount?: number
  tags?: string[]
  hiddenImages?: string[]   // Cloudinary public_ids excluded from display
}

type ProjectsConfig = Record<string, AdminProject[]>

async function readConfig(): Promise<ProjectsConfig> {
  return firestoreRead<ProjectsConfig>(PUBLIC_ID, {})
}

async function saveConfig(config: ProjectsConfig): Promise<void> {
  await firestoreWrite(PUBLIC_ID, config)
}

export async function GET() {
  const config = await readConfig()

  const enriched: ProjectsConfig = {}
  for (const [catId, projects] of Object.entries(config)) {
    enriched[catId] = await Promise.all(
      projects.map(async (p) => {
        const count = await cloudinary.search
          .expression(`folder="${p.folder}" AND resource_type:image`)
          .max_results(1)
          .execute()
          .then((r) => r.total_count)
          .catch(() => 0)

        const coverUrl = p.coverId
          ? cloudinary.url(p.coverId, { width: 1200, quality: 'auto', fetch_format: 'auto' })
          : null

        return { ...p, imageCount: count, coverUrl }
      })
    )
  }

  return NextResponse.json({ projects: enriched })
}

export async function POST(req: Request) {
  const body: { categoryId: string; project: Omit<AdminProject, 'id'> } = await req.json()
  const { categoryId, project } = body

  if (!categoryId || !project?.folder || !project?.title) {
    return NextResponse.json({ error: 'categoryId, folder, and title required' }, { status: 400 })
  }

  const config = await readConfig()
  if (!config[categoryId]) config[categoryId] = []

  const newProject: AdminProject = { ...project, id: `proj_${Date.now()}` }
  config[categoryId] = [newProject, ...config[categoryId]]
  await saveConfig(config)

  return NextResponse.json({ ok: true, project: newProject })
}

export async function DELETE(req: Request) {
  const { categoryId, projectId } = await req.json()

  if (!categoryId || !projectId) {
    return NextResponse.json({ error: 'categoryId and projectId required' }, { status: 400 })
  }

  const config = await readConfig()
  if (config[categoryId]) {
    config[categoryId] = config[categoryId].filter((p) => p.id !== projectId)
  }
  await saveConfig(config)

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const { categoryId, projectId, updates } = await req.json()

  const config = await readConfig()
  if (config[categoryId]) {
    config[categoryId] = config[categoryId].map((p) =>
      p.id === projectId ? { ...p, ...updates } : p
    )
  }
  await saveConfig(config)

  return NextResponse.json({ ok: true })
}
