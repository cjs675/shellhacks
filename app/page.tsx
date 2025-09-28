"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LineCrewDashboard } from "@/components/dashboards/line-crew-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"

export default function HomePage() {
  const { profile } = useAuth()

  return (
    <ProtectedRoute>
      {profile?.role === "line_crew" && <LineCrewDashboard />}
      {profile?.role === "admin" && <AdminDashboard />}
    </ProtectedRoute>
  )
}
