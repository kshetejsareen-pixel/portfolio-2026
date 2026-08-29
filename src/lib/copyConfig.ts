import { cache } from 'react'
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
  heroOneliner?: string
  projectsSectionTitle?: string
  heroTitleStyle?: TextStyle
  introLabelStyle?: TextStyle
  introBodyStyle?: TextStyle
  pullQuoteStyle?: TextStyle
  pullQuoteAttrStyle?: TextStyle
}

export interface InfoCopy {
  heroEyebrow?: string
  heroIntro?: string
  bioPara1?: string
  bioPara2?: string
  bioPara3?: string
  bioPara4?: string
  bioPara5?: string
  bioPara6?: string
  heroCap?: string
  bioHeading?: string
  practiceHeading?: string
  practiceItems?: string     // "Label — N" per line
  practiceNote?: string
  nowHeading?: string
  nowItems?: string          // one item per line
  clientsHeading?: string
  clients?: string           // "Name — Year" per line
  pressHeading?: string
  press?: string             // "Name — Year" per line
  touchHeading?: string
  touchEmail?: string
  touchEmailNote?: string
  touchAppointment?: string
  touchAppointmentNote?: string
  touchSocial?: string
  touchSocialNote?: string
}

export interface ContactCopy {
  tickerStatus?: string
  tickerLeadTime?: string
  heroTitle?: string
  heroPara1?: string
  heroPara2?: string
  inquiryEyebrow?: string
  inquiryHeading?: string
  inquiryNote?: string
  privacyText?: string
  directTitle?: string
  directDesc?: string
  directChannels?: string    // "Label | Value | Note | Href" per line
  notesEyebrow?: string
  notesLeft?: string         // "Label — Value" per line (left column)
  notesRight?: string        // "Label — Value" per line (right column)
}

export type CopyConfig = Record<string, Record<string, unknown>>

const PUBLIC_ID = 'ks-copy-config'

export async function readCopyConfig(): Promise<CopyConfig> {
  return firestoreRead<CopyConfig>(PUBLIC_ID, {})
}

export async function writeCopyConfig(config: CopyConfig): Promise<void> {
  await firestoreWrite(PUBLIC_ID, config)
}

// Server-side read for the page components. The copy that actually renders lives
// here, but the pages only fetched it from /api/copy in an effect — and robots.txt
// disallows /api/, so crawlers indexed the code fallbacks in categoryData.ts
// instead of the live text. cache() dedupes the read within a request.
const readCopyConfigCached = cache(readCopyConfig)

export async function getCategoryCopy(catId: string): Promise<CategoryCopy> {
  const config = await readCopyConfigCached()
  return (config[catId] ?? {}) as CategoryCopy
}
