import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

export const CATEGORY_IDS = ['culinary', 'spaces', 'portraits', 'objects', 'motion'] as const
export type CategoryId = typeof CATEGORY_IDS[number]
export type LandingConfig = Record<string, number>

export const MAX_FRAMES = 20

export const DEFAULT_CATEGORY_ORDER = ['culinary', 'spaces', 'portraits', 'objects', 'motion']

const CONFIG_DOC = 'ks-landing-config'
const ORDER_DOC  = 'ks-category-order'

const DEFAULT_CONFIG: LandingConfig = {
  culinary:  4,
  spaces:    4,
  portraits: 4,
  objects:   4,
  motion:    4,
}

export async function readLandingConfig(): Promise<LandingConfig> {
  const stored = await firestoreRead<LandingConfig>(CONFIG_DOC, {})
  return { ...DEFAULT_CONFIG, ...stored }
}

export async function writeLandingConfig(config: LandingConfig): Promise<void> {
  await firestoreWrite(CONFIG_DOC, config)
}

export async function readCategoryOrder(): Promise<string[]> {
  const data = await firestoreRead<{ order?: string[] }>(ORDER_DOC, {})
  return data.order ?? [...DEFAULT_CATEGORY_ORDER]
}

export async function writeCategoryOrder(order: string[]): Promise<void> {
  await firestoreWrite(ORDER_DOC, { order })
}
