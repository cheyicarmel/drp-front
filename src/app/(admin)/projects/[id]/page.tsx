import ProjectDetailPage from '@/components/projects/ProjectDetailPage'
import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface'

export const metadata: Metadata = {
  title: 'Projet | DrP — Driven Projects',
  description: 'Gérer votre projet.',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailRoute({ params }: Props) {
  const { id } = await params
  return <ProjectDetailPage projectId={id} />
}