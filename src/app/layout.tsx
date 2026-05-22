import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kshetej Sareen Studios',
  description: 'Luxury commercial photography studio. Delhi.',
  openGraph: {
    title: 'Kshetej Sareen Studios',
    description: 'Luxury commercial photography studio. Delhi.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
