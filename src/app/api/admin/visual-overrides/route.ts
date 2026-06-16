import { NextResponse } from 'next/server'
import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

const DOC_ID = 'visual-overrides'

export type PageOverrides = { selector: string; properties: Record<string, string> }[]
export type OverridesDoc = Record<string, PageOverrides>  // keyed by pageId

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page') || 'global'
  const doc = await firestoreRead<OverridesDoc>(DOC_ID, {})
  return NextResponse.json({ overrides: doc[page] ?? [] })
}

export async function POST(req: Request) {
  const { page, overrides } = await req.json() as { page: string; overrides: PageOverrides }
  if (!page) return NextResponse.json({ error: 'Missing page' }, { status: 400 })
  const doc = await firestoreRead<OverridesDoc>(DOC_ID, {})
  doc[page] = overrides
  await firestoreWrite(DOC_ID, doc)
  return NextResponse.json({ ok: true })
}
