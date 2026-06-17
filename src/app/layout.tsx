import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, JetBrains_Mono, Inter } from 'next/font/google'
import { PageTransition } from '@/components/PageTransition'
import { RevealObserver } from '@/components/RevealObserver'
import { FontLoader } from '@/components/FontLoader'
import { VisualEditorRoot } from '@/components/VisualEditorRoot'
import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kshetejsareen.com'),
  title: 'Kshetej Sareen',
  description: 'Independent photographer. New Delhi · Bangalore.',
  authors: [{ name: 'Kshetej Sareen', url: 'https://www.kshetejsareen.com' }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'Kshetej Sareen',
    description: 'Independent photographer. New Delhi · Bangalore.',
    url: 'https://www.kshetejsareen.com',
    type: 'website',
    siteName: 'Kshetej Sareen Studios',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kshetej Sareen',
    description: 'Independent photographer. New Delhi · Bangalore.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://www.kshetejsareen.com/#person',
      name: 'Kshetej Sareen',
      url: 'https://www.kshetejsareen.com',
      jobTitle: 'Photographer',
      description: 'Independent photographer based in New Delhi and Bangalore, specialising in culinary, interiors, portraits, objects, and motion work.',
      knowsAbout: [
        'Photography',
        'Food and Beverage Photography',
        'Interior and Architectural Photography',
        'Portrait Photography',
        'Still Life Photography',
        'Motion Direction',
        'Editorial Photography',
        'Commercial Photography',
      ],
      address: [
        { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressCountry: 'IN' },
        { '@type': 'PostalAddress', addressLocality: 'Bangalore', addressCountry: 'IN' },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.kshetejsareen.com/#website',
      url: 'https://www.kshetejsareen.com',
      name: 'Kshetej Sareen Studios',
      description: 'Portfolio of independent photographer Kshetej Sareen.',
      author: { '@id': 'https://www.kshetejsareen.com/#person' },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jetbrains.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <FontLoader />
        <RevealObserver />
        <VisualEditorRoot />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
