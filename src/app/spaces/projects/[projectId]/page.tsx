import { KsProjectPage } from '@/components/KsProjectPage'

type Props = { params: Promise<{ projectId: string }> }

export default async function SpacesProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId="spaces" projectId={projectId} />
}
