'use client'

import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import ProjectCard from './ProjectCard'
import ProjectFormModal from './ProjectFormModal'
import { Project } from '@/types'

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'IDEA', label: 'Idée' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE', label: 'Terminé' },
  { value: 'ON_HOLD', label: 'En pause' },
]

const priorityOptions = [
  { value: '', label: 'Toutes les priorités' },
  { value: 'LOW', label: 'Basse' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
]

const LIMIT = 9

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const { data, isLoading, isError } = useProjects({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page,
    limit: LIMIT,
  })

  const projects = data?.projects ?? []
  const pagination = data?.pagination

  // Reset page à 1 quand on change un filtre
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value)
    setPage(1)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Projets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} projet{(pagination?.total ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Nouveau projet
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {statusOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => handlePriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {priorityOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Impossible de charger les projets.
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M3 6h18M3 12h12M3 18h8" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Aucun projet pour l'instant.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-400">
                Page {pagination.page} sur {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 hover:text-brand-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Précédent
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 hover:text-brand-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                >
                  Suivant
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}