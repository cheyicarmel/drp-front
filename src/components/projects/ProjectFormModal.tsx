'use client'

import { useState, useRef } from 'react'
import { Project, ProjectStatus, Priority } from '@/types'
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects'
import { useUpload } from '@/hooks/useUpload'

interface Props {
  project: Project | null
  onClose: () => void
}

export default function ProjectFormModal({ project, onClose }: Props) {
  const isEditing = !!project
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const { uploadImage, isUploading } = useUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: project?.title ?? '',
    description: project?.description ?? '',
    context: project?.context ?? '',
    status: project?.status ?? 'IDEA' as ProjectStatus,
    priority: project?.priority ?? 'MEDIUM' as Priority,
    estimatedHours: project?.estimatedHours?.toString() ?? '',
    githubUrl: project?.githubUrl ?? '',
    demoUrl: project?.demoUrl ?? '',
    techStack: project?.techStack ?? '',
    imageUrl: project?.imageUrl ?? '',
    githubDisabled: project?.githubDisabled ?? false,
  })

  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(project?.imageUrl ?? '')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    try {
      const url = await uploadImage(file)
      setForm(prev => ({ ...prev, imageUrl: url }))
    } catch {
      setError("Erreur lors de l'upload de l'image.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Le titre est requis.')
      return
    }

    const data = {
      ...form,
      estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : undefined,
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: project.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image du projet
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-brand-400 transition-colors"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm">Cliquer pour uploader une image</span>
                      <span className="text-xs">JPG, PNG ou WebP — max 5MB</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Mon super projet"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décris ton projet en quelques phrases..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Contexte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Contexte
            </label>
            <textarea
              name="context"
              value={form.context}
              onChange={handleChange}
              placeholder="Contexte ou problématique à l'origine du projet..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Statut + Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Statut
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                <option value="IDEA">Idée</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminé</option>
                <option value="ON_HOLD">En pause</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Priorité
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
              </select>
            </div>
          </div>

          {/* Temps estimé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Temps estimé (heures)
            </label>
            <input
              name="estimatedHours"
              type="number"
              value={form.estimatedHours}
              onChange={handleChange}
              placeholder="Ex: 20"
              min="0"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Stack technique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Stack technique
            </label>
            <input
              name="techStack"
              value={form.techStack}
              onChange={handleChange}
              placeholder="React, Node.js, PostgreSQL..."
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            <p className="mt-1 text-xs text-gray-400">Sépare les technologies par des virgules</p>
          </div>

          {/* GitHub + Demo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Lien GitHub
              </label>
              <input
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Lien démo
              </label>
              <input
                name="demoUrl"
                value={form.demoUrl}
                onChange={handleChange}
                placeholder="https://mon-projet.netlify.app"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>
          </div>

          {/* GitHub disabled */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="githubDisabled"
              id="githubDisabled"
              checked={form.githubDisabled}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="githubDisabled" className="text-sm text-gray-700 dark:text-gray-300">
              Désactiver le lien GitHub sur le portfolio (repo privé)
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isPending ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}