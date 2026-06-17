import type { MetadataRoute } from 'next'

const BASE = 'https://www.kshetejsareen.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/culinary`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/spaces`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/objects`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/portraits`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/motion`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/info`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },
  ]
}
