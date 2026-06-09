import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

export interface FontConfig {
  serifFamily?: string
  monoFamily?: string
  sansFamily?: string
}

const DOC_ID = 'ks-font-config'

export async function readFontConfig(): Promise<FontConfig> {
  return firestoreRead<FontConfig>(DOC_ID, {})
}

export async function writeFontConfig(config: FontConfig): Promise<void> {
  await firestoreWrite(DOC_ID, config)
}
