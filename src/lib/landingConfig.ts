import { readFile, writeFile } from 'fs/promises'
import path from 'path'

export const CATEGORY_IDS = ['culinary', 'spaces', 'portraits', 'objects', 'motion'] as const
export type CategoryId = typeof CATEGORY_IDS[number]
export type LandingConfig = Record<string, number>

export const MAX_FRAMES = 20

const CONFIG_PATH = path.join(process.cwd(), 'data', 'landing-config.json')

const DEFAULT_CONFIG: LandingConfig = {
  culinary: 4,
  spaces: 3,
  portraits: 5,
  objects: 3,
  motion: 2,
}

export async function readLandingConfig(): Promise<LandingConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export async function writeLandingConfig(config: LandingConfig): Promise<void> {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
}
