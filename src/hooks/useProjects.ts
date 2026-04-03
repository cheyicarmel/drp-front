import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Project } from '@/types'

interface ProjectsResponse {
  projects: Project[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface ProjectFilters {
  status?: string
  priority?: string
  page?: number
  limit?: number
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      const response = await api.get(`/projects?${params.toString()}`)
      return response.data as ProjectsResponse
    }
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}`)
      return response.data.project as Project
    }
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const response = await api.post('/projects', data)
      return response.data.project as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const response = await api.patch(`/projects/${id}`, data)
      return response.data.project as Project
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

export function useTogglePublish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/projects/${id}/publish`)
      return response.data.project as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}