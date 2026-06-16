import type { Metadata } from 'next'
import { CategoryLanding } from '@/components/CategoryLanding'
import { getLandingData } from '@/lib/getLandingData'
import { readCopyConfig } from '@/lib/copyConfig'
import { getInfoPortrait } from '@/lib/getInfoData'

const SITE_URL = 'https://www.kshetejsareen.com'

export async function generateMetadata(): Promise<Metadata> {
  const portrait = await getInfoPortrait().catch(() => null)
  const ogImage  = portrait?.url ?? undefined

  return {
    title:       'Kshetej Sareen',
    description: "A closer look at the stories we've brought to life.",
    openGraph: {
      title:       'Kshetej Sareen Studios',
      description: "A closer look at the stories we've brought to life.",
      url:         SITE_URL,
      type:        'website',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 800 }] } : {}),
    },
    twitter: {
      card:        'summary_large_image',
      title:       'Kshetej Sareen Studios',
      description: "A closer look at the stories we've brought to life.",
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
