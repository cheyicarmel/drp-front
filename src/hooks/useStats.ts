import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface StatsData {
  projects: {
    total: number
    byStatus: Record<string, number>
  }
  tasks: {
    total: number
    byStatus: Record<string, number>
  }
  recentProjects: {
    id: string
    title: string
    status: string
    priority: string
    isPublic: boolean
    updatedAt: string
    _count: { tasks: number }
  }[]
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await api.get('/stats')
      return response.data as StatsData
    }
  })
}