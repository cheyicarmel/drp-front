import Link from "next/link"

const statusLabels: Record<string, { label: string; className: string }> = {
  IDEA: { label: 'Idée', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  DONE: { label: 'Terminé', className: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  ON_HOLD: { label: 'En pause', className: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
}

const priorityLabels: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Basse', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  MEDIUM: { label: 'Moyenne', className: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
  HIGH: { label: 'Haute', className: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
}

interface Project {
  id: string
  title: string
  status: string
  priority: string
  isPublic: boolean
  updatedAt: string
  _count: { tasks: number }
}

export default function RecentProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Projets récents
        </h2>
        <Link
          href="/projects"
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Voir tout
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          Aucun projet pour l'instant.{" "}
          <Link href="/projects" className="text-brand-500 hover:underline">
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Projet</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Statut</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Priorité</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Tâches</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden xl:table-cell">Publié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {projects.map((project) => {
                const status = statusLabels[project.status]
                const priority = priorityLabels[project.priority]
                return (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-gray-800 dark:text-white/90 hover:text-brand-500 dark:hover:text-brand-400"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {project._count.tasks}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden xl:table-cell">
                      {project.isPublic ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Privé
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}