import { KsProjectPage } from '@/components/KsProjectPage'

type Props = { params: Promise<{ projectId: string }> }

export default async function PortraitsProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId="portraits" projectId={projectId} />
}
