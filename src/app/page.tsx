import type { Metadata } from 'next'
import { CategoryLanding } from '@/components/CategoryLanding'
import { getLandingData } from '@/lib/getLandingData'
import { readCopyConfig } from '@/lib/copyConfig'
import { getInfoPortrait } from '@/lib/getInfoData'

const SITE_URL = 'https://www.kshetejsareen.com'

const HOME_TITLE = 'Kshetej Sareen — Photographer | New Delhi · Bangalore'
const HOME_DESCRIPTION =
  'Independent photographer in New Delhi and Bangalore. Culinary, interiors, portraits, still life and motion work for editorial and commercial commissions.'

export async function generateMetadata(): Promise<Metadata> {
  const portrait = await getInfoPortrait().catch(() => null)
  const ogImage  = portrait?.url ?? undefined

  return {
    title:       HOME_TITLE,
    description: HOME_DESCRIPTION,
    alternates:  { canonical: SITE_URL },
    openGraph: {
      title:       HOME_TITLE,
      description: HOME_DESCRIPTION,
      url:         SITE_URL,
      type:        'website',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 800 }] } : {}),
    },
    twitter: {
      card:        'summary_large_image',
      title:       HOME_TITLE,
      description: HOME_DESCRIPTION,
    },
  }
}

export default async function Home() {
  const [landingResult, copyResult] = await Promise.allSettled([
    getLandingData(),
    readCopyConfig(),
  ])

  const initialData = landingResult.status === 'fulfilled' ? landingResult.value : undefined

  const rawCopy = copyResult.status === 'fulfilled' ? copyResult.value : {}
  const land    = (rawCopy?.landing ?? {}) as Record<string, unknown>
  const contact = (rawCopy?.contact ?? {}) as Record<string, unknown>
  const initialCopy = {
    tickerStatus:        (land.tickerStatus   ?? contact.tickerStatus)   as string | undefined,
    tickerLeadTime:      (land.tickerLeadTime ?? contact.tickerLeadTime) as string | undefined,
    tickerStatusStyle:   land.tickerStatusStyle   as { font?: 'serif'|'mono'|'sans'; size?: number; italic?: boolean; bold?: boolean } | undefined,
    tickerLeadTimeStyle: land.tickerLeadTimeStyle as { font?: 'serif'|'mono'|'sans'; size?: number; italic?: boolean; bold?: boolean } | undefined,
    tagline:             land.tagline             as string | undefined,
    taglineStyle:        land.taglineStyle        as { font?: 'serif'|'mono'|'sans'; size?: number; italic?: boolean; bold?: boolean } | undefined,
  }

  return <CategoryLanding initialData={initialData} initialCopy={initialCopy} />
}
