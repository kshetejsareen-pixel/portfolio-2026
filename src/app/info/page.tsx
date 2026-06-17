import { InfoPage } from '@/components/InfoPage'
import { getInfoCopy, getInfoPortrait } from '@/lib/getInfoData'

export const metadata = {
  title: 'Info — Kshetej Sareen',
  description: 'Kshetej Sareen is an independent photographer based in New York and Bombay. Available for editorial, commercial, and fine-art commissions.',
  alternates: { canonical: 'https://www.kshetejsareen.com/info' },
  openGraph: {
    title: 'Info — Kshetej Sareen',
    description: 'Kshetej Sareen is an independent photographer based in New York and Bombay. Available for editorial, commercial, and fine-art commissions.',
    url: 'https://www.kshetejsareen.com/info',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Info — Kshetej Sareen',
    description: 'Independent photographer based in New York and Bombay.',
  },
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
