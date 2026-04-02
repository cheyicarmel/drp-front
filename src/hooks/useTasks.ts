import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Task, Subtask, TaskStatus } from '@/types'

// ─── TASKS ───────────────────────────────────────────────────────────────────

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/tasks`)
      return response.data.tasks as Task[]
    },
    enabled: !!projectId,
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await api.post(`/projects/${projectId}/tasks`, data)
      return response.data.task as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; description?: string; status?: TaskStatus } }) => {
      const response = await api.patch(`/projects/${projectId}/tasks/${id}`, data)
      return response.data.task as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

// ─── SUBTASKS ─────────────────────────────────────────────────────────────────

export function useCreateSubtask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const response = await api.post(`/tasks/${taskId}/subtasks`, { title })
      return response.data.subtask as Subtask
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })
}

export function useUpdateSubtask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, subtaskId, data }: { taskId: string; subtaskId: string; data: { title?: string; isDone?: boolean } }) => {
      const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
      return response.data.subtask as Subtask
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })
}

export function useDeleteSubtask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })
}