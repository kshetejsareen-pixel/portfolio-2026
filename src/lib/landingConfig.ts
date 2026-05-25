import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

export const CATEGORY_IDS = ['culinary', 'spaces', 'portraits', 'objects', 'motion'] as const
export type CategoryId = typeof CATEGORY_IDS[number]
export type LandingConfig = Record<string, number>

export const MAX_FRAMES = 20

const PUBLIC_ID = 'ks-landing-config'

const DEFAULT_CONFIG: LandingConfig = {
  culinary:  4,
  spaces:    4,
  portraits: 4,
  objects:   4,
  motion:    4,
}

export async function readLandingConfig(): Promise<LandingConfig> {
  const stored = await firestoreRead<LandingConfig>(PUBLIC_ID, {})
  return { ...DEFAULT_CONFIG, ...stored }
}

export async function writeLandingConfig(config: LandingConfig): Promise<void> {
  await firestoreWrite(PUBLIC_ID, config)
}
