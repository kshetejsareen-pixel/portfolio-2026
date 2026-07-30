import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServiceLandingPage } from '@/components/ServiceLandingPage'
import { LANDING_PAGES, LANDING_PAGE_MAP } from '@/lib/landingPages'
import { getGalleryData, getCategoryOgImage } from '@/lib/getGalleryData'

const BASE = 'https://www.kshetejsareen.com'

export const dynamicParams = false

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const def = LANDING_PAGE_MAP[slug]
  if (!def) return {}
  const ogImage = await getCategoryOgImage(def.catId)
  const url = `${BASE}/${def.slug}`
  return {
    title: def.title,
    description: def.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: def.title,
      description: def.metaDescription,
      url,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: def.title,
      description: def.metaDescription,
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const def = LANDING_PAGE_MAP[slug]
  if (!def) notFound()

  const gallery = await getGalleryData(def.catId).catch(() => null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE}/${def.slug}#service`,
        name: def.h1,
        serviceType: `${def.serviceLabel} Photography`,
        areaServed: { '@type': 'City', name: def.city },
        provider: { '@id': `${BASE}/#studio` },
        url: `${BASE}/${def.slug}`,
        description: def.metaDescription,
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE}/${def.slug}#faq`,
        mainEntity: def.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceLandingPage def={def} gallery={gallery} />
    </>
  )
}
