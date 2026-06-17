import { ContactPage } from '@/components/ContactPage'
import { getContactCopy } from '@/lib/getContactData'

export const metadata = {
  title: 'Contact — Kshetej Sareen',
  description: 'Commission editorial, culinary, spaces, portraits or motion work. Studio in New York and Bombay.',
  alternates: { canonical: 'https://www.kshetejsareen.com/contact' },
  openGraph: {
    title: 'Contact — Kshetej Sareen',
    description: 'Commission editorial, culinary, spaces, portraits or motion work. Studio in New York and Bombay.',
    url: 'https://www.kshetejsareen.com/contact',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Contact — Kshetej Sareen',
    description: 'Commission work with Kshetej Sareen. Studio in New York and Bombay.',
  },
}

export default async function Contact() {
  try {
    const initialCopy = await getContactCopy()
    return <ContactPage initialCopy={initialCopy} />
  } catch {
    return <ContactPage />
  }
}
