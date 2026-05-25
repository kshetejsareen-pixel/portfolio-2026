import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

export interface CategoryCopy {
  introLabel?: string
  introBody?: string
  pullQuoteText?: string
  pullQuoteAttr?: string
  heroTitle?: string
  projectsSectionTitle?: string
}

export type CopyConfig = Record<string, CategoryCopy>

const PUBLIC_ID = 'ks-copy-config'

export async function readCopyConfig(): Promise<CopyConfig> {
  return firestoreRead<CopyConfig>(PUBLIC_ID, {})
}

export async function writeCopyConfig(config: CopyConfig): Promise<void> {
  await firestoreWrite(PUBLIC_ID, config)
}
