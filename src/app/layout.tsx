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
  title: 'Kshetej Sareen',
  description: 'Independent photographer. New York · Bombay.',
  openGraph: {
    title: 'Kshetej Sareen',
    description: 'Independent photographer. New York · Bombay.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jetbrains.variable} ${inter.variable}`}>
      <body className="antialiased">
        <FontLoader />
        <RevealObserver />
        <VisualEditorRoot />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
