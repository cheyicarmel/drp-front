"use client"

import { useStats } from "@/hooks/useStats"
import StatsCard from "./StatsCard"
import RecentProjectsTable from "./RecentProjectsTable"

export default function Dashboard() {
  const { data, isLoading, isError } = useStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Impossible de charger les données.
        </div>
      </div>
    )
  }

  const { projects, tasks, recentProjects } = data!

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Vue d'ensemble de mes projets et tâches.
        </p>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="N de Projets total"
          value={projects.total}
          color="blue"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h12M3 18h8" strokeLinecap="round"/>
            </svg>
          }
        />
        <StatsCard
          title="En cours"
          value={projects.byStatus['IN_PROGRESS'] ?? 0}
          color="orange"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
          }
        />
        <StatsCard
          title="Terminés"
          value={projects.byStatus['DONE'] ?? 0}
          color="green"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <StatsCard
          title="N de Tâches totales"
          value={tasks.total}
          color="purple"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          }
        />
      </div>

      {/* Projets récents */}
      <RecentProjectsTable projects={recentProjects} />

    </div>
  )
}