export function isYouTubeShort(input: string): boolean {
  return /\/shorts\//.test(input.trim())
}

export function extractYouTubeId(input: string): string | null {
  const s = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (short) return short[1]
  const shorts = s.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shorts) return shorts[1]
  const long = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (long) return long[1]
  const embed = s.match(/embed\/([a-zA-Z0-9_-]{11})/)
  if (embed) return embed[1]
  return null
}
