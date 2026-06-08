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
  heroIntro?: string
  bioPara1?: string
  bioPara2?: string
  heroCap?: string           // photo caption, e.g. "Self · Studio · 2026"
  practiceItems?: string     // "Label — N" per line
  practiceNote?: string
  nowItems?: string          // one item per line
  clients?: string           // "Name — Year" per line
  press?: string             // "Name — Year" per line
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
  inquiryHeading?: string
  inquiryNote?: string
  privacyText?: string
  directTitle?: string
  directDesc?: string
  directChannels?: string    // "Label | Value | Note | Href" per line
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
