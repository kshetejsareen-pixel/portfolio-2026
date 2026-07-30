import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { MotionVideoGallery } from '@/components/MotionVideoGallery'
import { motionData } from '@/lib/categoryData'
import { readMotionVideos } from '@/lib/motionVideos'
import { getGalleryData, getCategoryOgImage } from '@/lib/getGalleryData'

export const dynamic = 'force-dynamic'

const TITLE = 'Motion & Video Direction — Kshetej Sareen'
const DESCRIPTION = 'Motion work and video direction by Kshetej Sareen. Visual narratives for editorial and commercial clients.'
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
  const [motionDoc, initialGallery] = await Promise.allSettled([
    readMotionVideos(),
    getGalleryData('motion'),
  ]).then(([v, g]) => [
    v.status === 'fulfilled' ? v.value : { videos: [] },
    g.status === 'fulfilled' ? g.value : undefined,
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
      initialGallery={initialGallery}
      bannerVideoId={bannerVideoId}
      yearRange={motionYearRange}
      videoGallery={videos.length > 0 ? <MotionVideoGallery videos={videos} /> : undefined}
    />
  )
}
