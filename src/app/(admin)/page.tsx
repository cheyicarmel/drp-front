import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "DrP - Pilotage de projets",
  description: "DrP est une application de gestion de projets conçue pour les développeurs, offrant une interface intuitive pour suivre l'avancement des projets, gérer les tâches et collaborer efficacement.",
};

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Dashboard — DrP
      </h1>
      <p className="text-gray-500 mt-2">
        Bienvenue sur ton espace de pilotage.
      </p>
    </div>
  )
}