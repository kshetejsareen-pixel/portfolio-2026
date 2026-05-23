import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import cloudinary from '@/lib/cloudinary'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'projects-config.json')

export interface AdminProject {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  coverId?: string
  imageCount?: number
}

type ProjectsConfig = Record<string, AdminProject[]>

async function readConfig(): Promise<ProjectsConfig> {
  try {
    return JSON.parse(await readFile(CONFIG_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

async function saveConfig(config: ProjectsConfig) {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export async function GET() {
  const config = await readConfig()

  // Enrich with live image counts from Cloudinary
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
          ? cloudinary.url(p.coverId, { width: 600, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' })
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

  const newProject: AdminProject = {
    ...project,
    id: `proj_${Date.now()}`,
  }

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
