import { KsProjectPage } from '@/components/KsProjectPage'

type Props = { params: Promise<{ projectId: string }> }

export default async function MotionProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId="motion" projectId={projectId} />
}
