import type { Metadata } from 'next'
import { InfoPage } from '@/components/InfoPage'
import { getInfoCopy, getInfoPortrait } from '@/lib/getInfoData'

const TITLE = 'Info — Kshetej Sareen'
const DESCRIPTION = 'Kshetej Sareen is an independent photographer based in New Delhi and Bangalore. Available for editorial, commercial, and fine-art commissions.'
const URL = 'https://www.kshetejsareen.com/info'

export async function generateMetadata(): Promise<Metadata> {
  const portrait = await getInfoPortrait().catch(() => null)
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: URL },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: URL,
      type: 'website',
      ...(portrait?.url ? { images: [{ url: portrait.url }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: 'Independent photographer based in New Delhi and Bangalore.',
    },
  }
}

export default async function Page() {
  try {
    const [initialCopy, initialPortrait] = await Promise.all([
      getInfoCopy(),
      getInfoPortrait(),
    ])
    return <InfoPage initialCopy={initialCopy} initialPortrait={initialPortrait} />
  } catch {
    return <InfoPage />
  }
}
