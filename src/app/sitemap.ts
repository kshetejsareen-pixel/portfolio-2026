import type { MetadataRoute } from 'next'
import { LANDING_PAGES } from '@/lib/landingPages'
import { getProjectsByCategory } from '@/lib/projects'

const BASE = 'https://www.kshetejsareen.com'

// The sitemap is generated per request rather than at build time, because the
// project list lives in Firestore and is edited from the admin panel — a
// build-time snapshot would go stale the first time a project is added.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Project pages were absent from the sitemap entirely, which is part of why
  // named-venue searches never reached them.
  let projectUrls: MetadataRoute.Sitemap = []
  try {
    const byCategory = await getProjectsByCategory()
    projectUrls = Object.entries(byCategory).flatMap(([catId, projects]) =>
      projects.map((p) => ({
        url: `${BASE}/${catId}/projects/${p.id}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    )
  } catch {
    // A Firestore outage should cost the sitemap its project entries, not the
    // whole file.
    projectUrls = []
  }

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
    ...projectUrls,
  ]
}
