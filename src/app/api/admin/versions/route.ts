import { NextResponse } from 'next/server'
import { listStoreDocs, listVersions, restoreVersion } from '@/lib/firestoreStore'

// Auth is handled upstream: src/middleware.ts rejects any /api/admin/* request
// without a valid admin_token cookie before this route runs.

// GET /api/admin/versions            → every document in the store
// GET /api/admin/versions?doc=<id>   → that document's saved versions, newest first
export async function GET(req: Request) {
  const doc = new URL(req.url).searchParams.get('doc')
  try {
    if (!doc) return NextResponse.json({ docs: await listStoreDocs() })
    return NextResponse.json({ doc, versions: await listVersions(doc) })
  } catch (err) {
    console.error('[api/admin/versions] GET failed', err)
    return NextResponse.json({ error: 'Could not read version history' }, { status: 500 })
  }
}

// POST { doc, version } → roll that document back to that version
export async function POST(req: Request) {
  const { doc, version } = await req.json() as { doc?: string; version?: string }
  if (!doc || !version) {
    return NextResponse.json({ error: 'Missing doc or version' }, { status: 400 })
  }
  try {
    const ok = await restoreVersion(doc, version)
    if (!ok) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    return NextResponse.json({ ok: true, doc, version })
  } catch (err) {
    console.error('[api/admin/versions] restore failed', err)
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 })
  }
}
