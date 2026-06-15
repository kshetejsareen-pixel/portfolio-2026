import type { Metadata } from 'next'
import { InfoPage } from '@/components/InfoPage'
import { getInfoCopy, getInfoPortrait } from '@/lib/getInfoData'

export const metadata: Metadata = {
  title: 'Info — Kshetej Sareen',
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
