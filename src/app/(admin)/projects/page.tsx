import { Metadata } from 'next'
import ProjectsPage from '@/components/projects/ProjectsPage'

export const metadata: Metadata = {
  title: 'Projets | DrP — Driven Projects',
  description: 'Gérez vos projets.',
}

export default function Projects() {
  return <ProjectsPage />
}