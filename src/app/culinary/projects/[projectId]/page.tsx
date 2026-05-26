import { KsProjectPage } from '@/components/KsProjectPage'

type Props = { params: Promise<{ projectId: string }> }

export default async function CulinaryProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId="culinary" projectId={projectId} />
}
