import { KsCategoryPage } from '@/components/KsCategoryPage'
import { MotionVideoGallery } from '@/components/MotionVideoGallery'
import { motionData } from '@/lib/categoryData'
import { readMotionVideos } from '@/lib/motionVideos'
import { getGalleryData } from '@/lib/getGalleryData'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Motion — Kshetej Sareen' }

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
