import { Metadata } from "next"
import Dashboard from "@/components/dashboard/Dashboard"

export const metadata: Metadata = {
  title: "Dashboard | DrP — Driven Projects",
  description: "Tableau de bord de pilotage de projets.",
}

export default function DashboardPage() {
  return <Dashboard />
}