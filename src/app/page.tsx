import { CategoryLanding } from '@/components/CategoryLanding'
import { getLandingData } from '@/lib/getLandingData'
import { readCopyConfig } from '@/lib/copyConfig'

export const metadata = {
  title: 'Kshetej Sareen',
  description:
    'Minimal landing page for premium photography categories: F&B x Lifestyle, Interiors & Architecture, Founder Portraits, Products.',
  openGraph: {
    title: 'Kshetej Sareen',
    description:
      'Minimal landing page directing visitors to premium photography categories.',
    type: 'website',
  },
}

export default async function Home() {
  const [landingResult, copyResult] = await Promise.allSettled([
    getLandingData(),
    readCopyConfig(),
  ])

  const initialData = landingResult.status === 'fulfilled' ? landingResult.value : undefined

  const rawCopy   = copyResult.status === 'fulfilled' ? copyResult.value : {}
  const land      = (rawCopy?.landing  ?? {}) as Record<string, unknown>
  const contact   = (rawCopy?.contact  ?? {}) as Record<string, unknown>
  const initialCopy = {
    tickerStatus:       (land.tickerStatus    ?? contact.tickerStatus)    as string | undefined,
    tickerLeadTime:     (land.tickerLeadTime  ?? contact.tickerLeadTime)  as string | undefined,
    tickerStatusStyle:  land.tickerStatusStyle  as { font?: 'serif'|'mono'|'sans'; size?: number; italic?: boolean; bold?: boolean } | undefined,
    tickerLeadTimeStyle: land.tickerLeadTimeStyle as { font?: 'serif'|'mono'|'sans'; size?: number; italic?: boolean; bold?: boolean } | undefined,
    tagline:            land.tagline           as string | undefined,
    taglineStyle:       land.taglineStyle      as { font?: 'serif'|'mono'|'sans'; size?: number; italic?: boolean; bold?: boolean } | undefined,
  }

  return <CategoryLanding initialData={initialData} initialCopy={initialCopy} />
}
