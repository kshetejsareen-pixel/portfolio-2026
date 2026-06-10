import { NextResponse } from 'next/server'
import { readMotionVideos, writeMotionVideos } from '@/lib/motionVideos'
import type { MotionVideosDoc } from '@/lib/motionVideos'

export async function GET() {
  const doc = await readMotionVideos()
  return NextResponse.json(doc)
}

export async function POST(req: Request) {
  const body: MotionVideosDoc = await req.json()
  await writeMotionVideos(body)
  return NextResponse.json({ ok: true })
}
