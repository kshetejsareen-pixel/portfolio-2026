import { KsProjectPage } from '@/components/KsProjectPage'

type Props = { params: Promise<{ projectId: string }> }

export default async function ObjectsProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId="objects" projectId={projectId} />
}
