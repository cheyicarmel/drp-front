'use client'

import { useState, useRef, useEffect } from 'react'
import { Task, TaskStatus } from '@/types'
import {
  useUpdateTask,
  useDeleteTask,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
} from '@/hooks/useTasks'

const taskStatusConfig: Record<TaskStatus, { label: string; next: TaskStatus; className: string }> = {
  TODO: { label: 'À faire', next: 'IN_PROGRESS', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  IN_PROGRESS: { label: 'En cours', next: 'DONE', className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  DONE: { label: 'Terminé', next: 'TODO', className: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
}

interface TaskItemProps {
  task: Task
  projectId: string
}

export default function TaskItem({ task, projectId }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)

  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)
  const createSubtask = useCreateSubtask(projectId)
  const updateSubtask = useUpdateSubtask(projectId)
  const deleteSubtask = useDeleteSubtask(projectId)

  const statusCfg = taskStatusConfig[task.status]
  const subtasks = task.subtasks ?? []
  const doneCount = subtasks.filter(s => s.isDone).length

  useEffect(() => {
    if (isEditing) editInputRef.current?.focus()
  }, [isEditing])

  useEffect(() => {
    if (isAddingSubtask) subtaskInputRef.current?.focus()
  }, [isAddingSubtask])

  const handleStatusCycle = () => {
    updateTask.mutate({ id: task.id, data: { status: statusCfg.next } })
  }

  const handleEditSubmit = () => {
    const trimmed = editTitle.trim()
    if (!trimmed || trimmed === task.title) {
      setEditTitle(task.title)
      setIsEditing(false)
      return
    }
    updateTask.mutate({ id: task.id, data: { title: trimmed } }, {
      onSuccess: () => setIsEditing(false),
    })
  }

  const handleDelete = () => {
    if (confirm(`Supprimer la tâche "${task.title}" ?`)) {
      deleteTask.mutate(task.id)
    }
  }

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim()
    if (!trimmed) return
    createSubtask.mutate({ taskId: task.id, title: trimmed }, {
      onSuccess: () => {
        setNewSubtaskTitle('')
        setIsAddingSubtask(false)
      },
    })
  }

  const handleToggleSubtask = (subtaskId: string, isDone: boolean) => {
    updateSubtask.mutate({ taskId: task.id, subtaskId, data: { isDone: !isDone } })
  }

  const handleDeleteSubtask = (subtaskId: string, title: string) => {
    if (confirm(`Supprimer "${title}" ?`)) {
      deleteSubtask.mutate({ taskId: task.id, subtaskId })
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] overflow-hidden">
      {/* Task row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status badge — click to cycle */}
        <button
          onClick={handleStatusCycle}
          disabled={updateTask.isPending}
          title="Changer le statut"
          className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40 ${statusCfg.className}`}
        >
          {statusCfg.label}
        </button>

        {/* Title — click to edit */}
        {isEditing ? (
          <input
            ref={editInputRef}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditSubmit()
              if (e.key === 'Escape') { setEditTitle(task.title); setIsEditing(false) }
            }}
            className="flex-1 text-sm bg-transparent border-b border-brand-500 text-gray-800 dark:text-white/90 focus:outline-none"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`flex-1 text-sm cursor-text text-gray-800 dark:text-white/90 hover:text-brand-500 dark:hover:text-brand-400 transition-colors ${task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}
          >
            {task.title}
          </span>
        )}

        {/* Subtask count */}
        {subtasks.length > 0 && (
          <span className="text-xs text-gray-400 flex-shrink-0">
            {doneCount}/{subtasks.length}
          </span>
        )}

        {/* Accordion toggle */}
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isOpen ? 'Replier' : 'Déplier'}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Delete task */}
        <button
          onClick={handleDelete}
          disabled={deleteTask.isPending}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
          title="Supprimer la tâche"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Accordion — subtasks */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-2 bg-gray-50/50 dark:bg-white/[0.01]">

          {subtasks.length === 0 && !isAddingSubtask && (
            <p className="text-xs text-gray-400 italic">Aucune sous-tâche</p>
          )}

          {subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center gap-2.5 group">
              <input
                type="checkbox"
                checked={subtask.isDone}
                onChange={() => handleToggleSubtask(subtask.id, subtask.isDone)}
                disabled={updateSubtask.isPending}
                className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer flex-shrink-0"
              />
              <span className={`flex-1 text-sm ${subtask.isDone ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                {subtask.title}
              </span>
              <button
                onClick={() => handleDeleteSubtask(subtask.id, subtask.title)}
                disabled={deleteSubtask.isPending}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 transition-all disabled:opacity-40"
                title="Supprimer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}

          {/* Add subtask inline */}
          {isAddingSubtask ? (
            <div className="flex items-center gap-2 pt-1">
              <div className="w-4 h-4 flex-shrink-0" /> {/* spacer align with checkboxes */}
              <input
                ref={subtaskInputRef}
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddSubtask()
                  if (e.key === 'Escape') { setNewSubtaskTitle(''); setIsAddingSubtask(false) }
                }}
                placeholder="Titre de la sous-tâche..."
                className="flex-1 text-sm bg-transparent border-b border-brand-500 text-gray-800 dark:text-white/90 placeholder-gray-400 focus:outline-none py-0.5"
              />
              <button
                onClick={handleAddSubtask}
                disabled={createSubtask.isPending || !newSubtaskTitle.trim()}
                className="text-xs font-medium text-brand-500 hover:text-brand-600 disabled:opacity-40 transition-colors flex-shrink-0"
              >
                {createSubtask.isPending ? '...' : 'Ajouter'}
              </button>
              <button
                onClick={() => { setNewSubtaskTitle(''); setIsAddingSubtask(false) }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-500 transition-colors pt-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              Ajouter une sous-tâche
            </button>
          )}
        </div>
      )}
    </div>
  )
}