import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

export interface MotionVideo {
  id: string
  youtubeId: string
  title: string
  year?: string
  location?: string
}

export interface MotionVideosDoc {
  videos: MotionVideo[]
}

const DOC_ID = 'motion-videos'

export async function readMotionVideos(): Promise<MotionVideosDoc> {
  const doc = await firestoreRead<MotionVideosDoc>(DOC_ID, { videos: [] })
  return { videos: doc.videos ?? [] }
}

export async function writeMotionVideos(doc: MotionVideosDoc): Promise<void> {
  await firestoreWrite(DOC_ID, doc)
}

export function extractYouTubeId(input: string): string | null {
  const s = input.trim()
  // Plain ID (11 chars, alphanumeric + - _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  // youtu.be/ID
  const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (short) return short[1]
  // youtube.com/watch?v=ID
  const long = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (long) return long[1]
  // youtube.com/embed/ID
  const embed = s.match(/embed\/([a-zA-Z0-9_-]{11})/)
  if (embed) return embed[1]
  return null
}
