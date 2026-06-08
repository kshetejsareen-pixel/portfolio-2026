import { firestoreRead, firestoreWrite } from '@/lib/firestoreStore'

export interface TextStyle {
  font?: 'serif' | 'mono' | 'sans'
  size?: number
  italic?: boolean
  bold?: boolean
}

export interface CategoryCopy {
  introLabel?: string
  introBody?: string
  pullQuoteText?: string
  pullQuoteAttr?: string
  heroTitle?: string
  projectsSectionTitle?: string
  heroTitleStyle?: TextStyle
  introLabelStyle?: TextStyle
  introBodyStyle?: TextStyle
  pullQuoteStyle?: TextStyle
  pullQuoteAttrStyle?: TextStyle
}

export interface InfoCopy {
  heroIntro?: string      // hero paragraph
  bioPara1?: string       // first biography paragraph
  bioPara2?: string       // second biography paragraph
  nowItems?: string       // newline-separated, one item per line
  clients?: string        // "Name — Year" per line
  press?: string          // "Name — Year" per line
}

export interface ContactCopy {
  tickerStatus?: string   // left ticker text
  tickerLeadTime?: string // right ticker text
  heroPara1?: string      // first hero paragraph
  heroPara2?: string      // second hero paragraph
}

export type CopyConfig = Record<string, Record<string, unknown>>

const PUBLIC_ID = 'ks-copy-config'

export async function readCopyConfig(): Promise<CopyConfig> {
  return firestoreRead<CopyConfig>(PUBLIC_ID, {})
}

export async function writeCopyConfig(config: CopyConfig): Promise<void> {
  await firestoreWrite(PUBLIC_ID, config)
}
