import type { Metadata } from 'next'
import { ContactPage } from '@/components/ContactPage'
import { getContactCopy } from '@/lib/getContactData'
import { getInfoPortrait } from '@/lib/getInfoData'

const TITLE = 'Contact — Kshetej Sareen'
const DESCRIPTION = 'Commission editorial, culinary, spaces, portraits or motion work. Studio in New Delhi and Bangalore.'
const URL = 'https://www.kshetejsareen.com/contact'

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
      description: 'Commission work with Kshetej Sareen. Studio in New Delhi and Bangalore.',
    },
  }
}

export default async function Contact() {
  try {
    const initialCopy = await getContactCopy()
    return <ContactPage initialCopy={initialCopy} />
  } catch {
    return <ContactPage />
  }
}
