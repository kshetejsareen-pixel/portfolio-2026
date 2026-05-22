import { CategoryLanding } from '@/components/CategoryLanding'

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

export default function Home() {
  return <CategoryLanding />
}
