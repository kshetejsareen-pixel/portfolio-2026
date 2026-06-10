import { NextResponse } from 'next/server'
import { readMotionVideos } from '@/lib/motionVideos'

export async function GET() {
  const doc = await readMotionVideos()
  return NextResponse.json(doc)
}
