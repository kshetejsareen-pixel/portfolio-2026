import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { MotionVideoGallery } from '@/components/MotionVideoGallery'
import { motionData } from '@/lib/categoryData'
import { readMotionVideos } from '@/lib/motionVideos'
import { getCategoryOgImage } from '@/lib/getGalleryData'
import { getCategoryServerData } from '@/lib/categoryServerData'

export const dynamic = 'force-dynamic'

const TITLE = 'Video & Film Production — Kshetej Sareen'
const DESCRIPTION = 'Brand films, food and property films, and product motion, directed by photographer Kshetej Sareen across Delhi, Gurgaon, Bangalore and Hyderabad.'
const URL = 'https://www.kshetejsareen.com/motion'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getCategoryOgImage('motion')
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: URL },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: URL,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: 'Motion work and video direction by Kshetej Sareen.',
    },
  }
}

export default async function MotionPage() {
  const [motionDoc, server] = await Promise.allSettled([
    readMotionVideos(),
    getCategoryServerData('motion'),
  ]).then(([v, s]) => [
    v.status === 'fulfilled' ? v.value : { videos: [] },
    s.status === 'fulfilled' ? s.value : {},
  ] as const)

  const { videos, bannerVideoId } = motionDoc as { videos: typeof motionDoc['videos']; bannerVideoId?: string }

  const motionYears = videos.map((v) => parseInt(v.year ?? '', 10)).filter((y) => !isNaN(y))
  const motionYearRange = motionYears.length > 0
    ? (() => {
        const min = Math.min(...motionYears)
        const max = Math.max(...motionYears)
        return min === max ? String(min) : `${min}–${max}`
      })()
    : null

  return (
    <KsCategoryPage
      data={motionData}
      catId="motion"
      {...server}
      bannerVideoId={bannerVideoId}
      yearRange={motionYearRange}
      videoGallery={videos.length > 0 ? <MotionVideoGallery videos={videos} /> : undefined}
    />
  )
}
