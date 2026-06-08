import { NextResponse } from 'next/server'
import { readCopyConfig, writeCopyConfig } from '@/lib/copyConfig'

export async function GET() {
  const config = await readCopyConfig()
  return NextResponse.json({ copy: config })
}

export async function PATCH(req: Request) {
  const { categoryId, updates }: { categoryId: string; updates: Record<string, unknown> } = await req.json()

  if (!categoryId) {
    return NextResponse.json({ error: 'categoryId required' }, { status: 400 })
  }

  const config = await readCopyConfig()
  config[categoryId] = { ...(config[categoryId] ?? {}), ...updates }
  await writeCopyConfig(config)

  return NextResponse.json({ ok: true, copy: config[categoryId] })
}
