import { KsCategoryPage } from '@/components/KsCategoryPage'
import { MotionVideoGallery } from '@/components/MotionVideoGallery'
import { motionData } from '@/lib/categoryData'
import { readMotionVideos } from '@/lib/motionVideos'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = { title: 'Motion — Kshetej Sareen' }

export default async function MotionPage() {
  const [{ videos }, initialGallery] = await Promise.allSettled([
    readMotionVideos(),
    getGalleryData('motion'),
  ]).then(([v, g]) => [
    v.status === 'fulfilled' ? v.value : { videos: [] },
    g.status === 'fulfilled' ? g.value : undefined,
  ] as const)

  return (
    <KsCategoryPage
      data={motionData}
      catId="motion"
      initialGallery={initialGallery}
      videoGallery={videos.length > 0 ? <MotionVideoGallery videos={videos} /> : undefined}
    />
  )
}
