'use client'

import Link from 'next/link'
import { Project } from '@/types'
import { useDeleteProject, useTogglePublish } from '@/hooks/useProjects'

const statusConfig: Record<string, { label: string; className: string }> = {
  IDEA: { label: 'Idée', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  DONE: { label: 'Terminé', className: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  ON_HOLD: { label: 'En pause', className: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Basse', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  MEDIUM: { label: 'Moyenne', className: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-500' },
  HIGH: { label: 'Haute', className: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const deleteMutation = useDeleteProject()
  const togglePublishMutation = useTogglePublish()

  const status = statusConfig[project.status]
  const priority = priorityConfig[project.priority]

  const handleDelete = () => {
    if (confirm(`Supprimer "${project.title}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(project.id)
    }
  }

  const handleTogglePublish = () => {
    togglePublishMutation.mutate(project.id)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex flex-col overflow-hidden">

      {/* Image */}
      {project.imageUrl ? (
        <div className="h-40 overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-300 dark:text-brand-700">
            <path d="M3 6h18M3 12h12M3 18h8" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link
            href={`/projects/${project.id}`}
            className="text-base font-semibold text-gray-800 dark:text-white/90 hover:text-brand-500 dark:hover:text-brand-400 line-clamp-1"
          >
            {project.title}
          </Link>
          {project.isPublic && (
            <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              Publié
            </span>
          )}
        </div>

        {project.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
            {project.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
            {priority.label}
          </span>
          {project._count && (
            <span className="ml-auto text-xs text-gray-400">
              {project._count.tasks} tâche{project._count.tasks > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onEdit(project)}
            className="flex-1 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={handleTogglePublish}
            disabled={togglePublishMutation.isPending}
            className="flex-1 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors disabled:opacity-50"
          >
            {project.isPublic ? 'Dépublier' : 'Publier'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}