import { Suspense } from "react"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics for your aircraft detailing operations
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}
