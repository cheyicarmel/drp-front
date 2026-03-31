export type ProjectStatus = 'IDEA' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Project {
  id: string
  userId: string
  title: string
  description?: string
  status: ProjectStatus
  priority: Priority
  estimatedHours?: number
  isPublic: boolean
  githubUrl?: string
  demoUrl?: string
  techStack?: string
  context?: string
  imageUrl?: string
  images?: string
  githubDisabled?: boolean
  createdAt: string
  updatedAt: string
  tasks?: Task[]
  _count?: { tasks: number }
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  position: number
  createdAt: string
  updatedAt: string
  subtasks?: Subtask[]
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  isDone: boolean
  position: number
  createdAt: string
}