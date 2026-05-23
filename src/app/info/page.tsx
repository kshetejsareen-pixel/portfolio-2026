import type { Metadata } from 'next'
import { InfoPage } from '@/components/InfoPage'

export const metadata: Metadata = {
  title: 'Info — Kshetej Sareen',
}

export default function Page() {
  return <InfoPage />
}
