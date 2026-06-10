import { KsCategoryPage } from '@/components/KsCategoryPage'
import { MotionVideoGallery } from '@/components/MotionVideoGallery'
import { motionData } from '@/lib/categoryData'
import { readMotionVideos } from '@/lib/motionVideos'

export const metadata = { title: 'Motion — Kshetej Sareen' }

export default async function MotionPage() {
  const { videos } = await readMotionVideos()
  return (
    <KsCategoryPage
      data={motionData}
      catId="motion"
      videoGallery={videos.length > 0 ? <MotionVideoGallery videos={videos} /> : undefined}
    />
  )
}
