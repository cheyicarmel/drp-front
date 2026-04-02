'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Project, TaskStatus } from '@/types'
import { useProject, useUpdateProject, useDeleteProject, useTogglePublish } from '@/hooks/useProjects'
import { useTasks, useCreateTask } from '@/hooks/useTasks'
import { useUpload } from '@/hooks/useUpload'
import ProjectFormModal from '@/components/projects/ProjectFormModal'
import TaskItem from '@/components/projects/TaskItem'

// ─── Config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  IDEA:        { label: 'Idée',      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  IN_PROGRESS: { label: 'En cours',  className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  DONE:        { label: 'Terminé',   className: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  ON_HOLD:     { label: 'En pause',  className: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW:    { label: 'Basse',   className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  MEDIUM: { label: 'Moyenne', className: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-500' },
  HIGH:   { label: 'Haute',   className: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
}

const taskStatusFilter: { key: TaskStatus | 'ALL'; label: string }[] = [
  { key: 'ALL',         label: 'Toutes' },
  { key: 'TODO',        label: 'À faire' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'DONE',        label: 'Terminées' },
]

// ─── Publish Guard ────────────────────────────────────────────────────────────

function getPublishError(project: Project): string | null {
  if (!['IN_PROGRESS', 'DONE'].includes(project.status)) {
    return "Le projet doit être « En cours » ou « Terminé » pour être publié."
  }
  if (!project.githubUrl && !project.githubDisabled) {
    return "Un lien GitHub est requis (ou désactive-le pour les repos privés)."
  }
  if (!project.demoUrl) return "Un lien démo est requis pour publier."
  if (!project.techStack) return "La stack technique est requise pour publier."
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  projectId: string
}

export default function ProjectDetailPage({ projectId }: Props) {
  const router = useRouter()
  const { data: project, isLoading, isError } = useProject(projectId)
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId)
  const deleteMutation = useDeleteProject()
  const togglePublish = useTogglePublish()
  const createTask = useCreateTask(projectId)
  const { uploadImage, isUploading } = useUpload()
  const updateProject = useUpdateProject()

  const [showEditModal, setShowEditModal] = useState(false)
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [publishError, setPublishError] = useState('')

  // Images multiples
  const [extraImages, setExtraImages] = useState<string[]>([])
  const extraImagesInputRef = useRef<HTMLInputElement>(null)

  // ── Loading / Error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-gray-500 dark:text-gray-400">Projet introuvable.</p>
        <Link href="/projects" className="text-sm text-brand-500 hover:text-brand-600">
          ← Retour aux projets
        </Link>
      </div>
    )
  }

  const status = statusConfig[project.status]
  const priority = priorityConfig[project.priority]
  const publishGuard = getPublishError(project)

  // ── Filtered tasks ──────────────────────────────────────────────────────────

  const filteredTasks = taskFilter === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === taskFilter)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    if (confirm(`Supprimer "${project.title}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate(project.id, {
        onSuccess: () => router.push('/projects'),
      })
    }
  }

  const handleTogglePublish = () => {
    setPublishError('')
    if (!project.isPublic && publishGuard) {
      setPublishError(publishGuard)
      return
    }
    togglePublish.mutate(project.id)
  }

  const handleAddTask = () => {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return
    createTask.mutate({ title: trimmed }, {
      onSuccess: () => {
        setNewTaskTitle('')
        setIsAddingTask(false)
      },
    })
  }

  const handleExtraImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const urls: string[] = []
    for (const file of files) {
      const url = await uploadImage(file)
      urls.push(url)
    }
    const currentImages = project.images ? project.images.split(',').filter(Boolean) : []
    const merged = [...currentImages, ...extraImages, ...urls]
    const joined = merged.join(',')
    updateProject.mutate({ id: project.id, data: { images: joined } })
    setExtraImages([])
    if (extraImagesInputRef.current) extraImagesInputRef.current.value = ''
  }

  const handleRemoveExtraImage = (urlToRemove: string) => {
    const currentImages = project.images ? project.images.split(',').filter(Boolean) : []
    const updated = currentImages.filter(u => u !== urlToRemove).join(',')
    updateProject.mutate({ id: project.id, data: { images: updated } })
  }

  const carouselImages = project.images ? project.images.split(',').filter(Boolean) : []
  const todoCount = tasks.filter(t => t.status === 'TODO').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const doneCount = tasks.filter(t => t.status === 'DONE').length

  return (
    <>
      <div className="space-y-6 pb-10">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/projects" className="hover:text-brand-500 transition-colors">Projets</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{project.title}</span>
        </nav>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
                {priority.label}
              </span>
              {project.isPublic && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Publié
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 truncate">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 hover:text-brand-500 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
              </svg>
              Modifier
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-500 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Supprimer
            </button>
          </div>
        </div>

        {/* ── Grille principale ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Colonne gauche (2/3) ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section Informations */}
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Informations
              </h2>

              {project.description && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-800 dark:text-white/80 leading-relaxed">{project.description}</p>
                </div>
              )}

              {project.context && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Contexte</p>
                  <p className="text-sm text-gray-800 dark:text-white/80 leading-relaxed">{project.context}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {project.estimatedHours && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Temps estimé</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{project.estimatedHours}h</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Créé le</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Mis à jour</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {new Date(project.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {project.techStack && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 mb-2">Stack technique</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.split(',').map(t => t.trim()).filter(Boolean).map(tech => (
                      <span key={tech} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(project.githubUrl || project.demoUrl) && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
                  {project.githubUrl && !project.githubDisabled && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round"/>
                        <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Démo live
                    </a>
                  )}
                </div>
              )}
            </section>

            {/* Section Tâches */}
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tâches
                  </h2>
                  {tasks.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {todoCount} à faire · {inProgressCount} en cours · {doneCount} terminées
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-500 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                  </svg>
                  Ajouter
                </button>
              </div>

              {/* Filter tabs */}
              {tasks.length > 0 && (
                <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                  {taskStatusFilter.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setTaskFilter(f.key)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        taskFilter === f.key
                          ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Add task inline */}
              {isAddingTask && (
                <div className="flex items-center gap-2 mb-3 p-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTask()
                      if (e.key === 'Escape') { setNewTaskTitle(''); setIsAddingTask(false) }
                    }}
                    placeholder="Titre de la tâche..."
                    className="flex-1 text-sm bg-transparent text-gray-800 dark:text-white/90 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={createTask.isPending || !newTaskTitle.trim()}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600 disabled:opacity-40 transition-colors flex-shrink-0"
                  >
                    {createTask.isPending ? '...' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => { setNewTaskTitle(''); setIsAddingTask(false) }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {/* Task list */}
              {tasksLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">
                  {tasks.length === 0 ? 'Aucune tâche pour ce projet.' : 'Aucune tâche dans ce filtre.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredTasks
                    .sort((a, b) => a.position - b.position)
                    .map(task => (
                      <TaskItem key={task.id} task={task} projectId={projectId} />
                    ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Colonne droite (1/3) ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Image principale */}
            {project.imageUrl && (
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              </section>
            )}

            {/* Section Portfolio */}
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Portfolio
              </h2>

              {/* Publish toggle */}
              <div className="mb-4">
                <button
                  onClick={handleTogglePublish}
                  disabled={togglePublish.isPending}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                    project.isPublic
                      ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30'
                      : 'bg-brand-500 text-white hover:bg-brand-600'
                  }`}
                >
                  {togglePublish.isPending
                    ? '...'
                    : project.isPublic
                      ? '✓ Publié — Cliquer pour dépublier'
                      : 'Publier sur le portfolio'}
                </button>
                {publishError && (
                  <p className="mt-2 text-xs text-red-500 dark:text-red-400">{publishError}</p>
                )}
              </div>

              {/* Portfolio fields recap */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">GitHub</span>
                  <span className={`text-xs font-medium ${project.githubUrl || project.githubDisabled ? 'text-green-500' : 'text-red-400'}`}>
                    {project.githubDisabled ? 'Désactivé (ok)' : project.githubUrl ? '✓' : '✗ Requis'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Démo</span>
                  <span className={`text-xs font-medium ${project.demoUrl ? 'text-green-500' : 'text-red-400'}`}>
                    {project.demoUrl ? '✓' : '✗ Requis'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Stack</span>
                  <span className={`text-xs font-medium ${project.techStack ? 'text-green-500' : 'text-red-400'}`}>
                    {project.techStack ? '✓' : '✗ Requis'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Statut</span>
                  <span className={`text-xs font-medium ${['IN_PROGRESS', 'DONE'].includes(project.status) ? 'text-green-500' : 'text-red-400'}`}>
                    {['IN_PROGRESS', 'DONE'].includes(project.status) ? '✓' : '✗ En cours ou Terminé'}
                  </span>
                </div>
              </div>

              {/* Images carousel */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">Images carousel ({carouselImages.length})</p>
                  <button
                    onClick={() => extraImagesInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 disabled:opacity-40 transition-colors"
                  >
                    {isUploading ? (
                      <div className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                      </svg>
                    )}
                    Ajouter
                  </button>
                  <input
                    ref={extraImagesInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleExtraImagesChange}
                    className="hidden"
                  />
                </div>

                {carouselImages.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Aucune image carousel</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {carouselImages.map((url, i) => (
                      <div key={i} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src={url} alt={`carousel-${i}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveExtraImage(url)}
                          disabled={updateProject.isPending}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <ProjectFormModal
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}