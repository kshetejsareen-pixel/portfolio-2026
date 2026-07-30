import type { MetadataRoute } from 'next'
import { LANDING_PAGES } from '@/lib/landingPages'

const BASE = 'https://www.kshetejsareen.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                   changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/culinary`,     changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/spaces`,       changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/objects`,      changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/portraits`,    changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/motion`,       changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/info`,         changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,      changeFrequency: 'yearly',  priority: 0.6 },
    ...LANDING_PAGES.map((p) => ({
      url: `${BASE}/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
