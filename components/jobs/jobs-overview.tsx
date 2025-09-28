"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, AlertCircle, DollarSign, Users } from "lucide-react"

interface Job {
  id: string
  job_number: string
  status: string
  priority: string
  scheduled_start: string | null
  scheduled_end: string | null
  total_estimated_cost: number | null
  total_actual_cost: number | null
  aircraft: {
    tail_number: string
    manufacturer: string
    model: string
    aircraft_type: string
  } | null
  customer: {
    company_name: string | null
    contact_name: string
    email: string
  } | null
  job_services: Array<{
    service: {
      service_name: string
      service_category: string
    } | null
  }>
}

interface JobsOverviewProps {
  jobs: Job[]
}

export function JobsOverview({ jobs }: JobsOverviewProps) {
  const totalJobs = jobs.length
  const scheduledJobs = jobs.filter((j) => j.status === "scheduled").length
  const inProgressJobs = jobs.filter((j) => j.status === "in_progress").length
  const completedJobs = jobs.filter((j) => j.status === "completed").length
  const cancelledJobs = jobs.filter((j) => j.status === "cancelled").length

  const totalRevenue = jobs
    .filter((j) => j.status === "completed")
    .reduce((sum, job) => sum + (job.total_actual_cost || job.total_estimated_cost || 0), 0)

  const estimatedRevenue = jobs
    .filter((j) => j.status !== "completed" && j.status !== "cancelled")
    .reduce((sum, job) => sum + (job.total_estimated_cost || 0), 0)

  const uniqueCustomers = new Set(jobs.map((j) => j.customer?.email).filter(Boolean)).size

  const stats = [
    {
      title: "Total Jobs",
      value: totalJobs,
      description: "All time",
      icon: Calendar,
    },
    {
      title: "In Progress",
      value: inProgressJobs,
      description: "Active jobs",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Completed",
      value: completedJobs,
      description: "Finished jobs",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "Completed jobs",
      icon: DollarSign,
      color: "text-green-600",
    },
  ]

  const statusBreakdown = [
    { status: "Scheduled", count: scheduledJobs, color: "bg-blue-500" },
    { status: "In Progress", count: inProgressJobs, color: "bg-orange-500" },
    { status: "Completed", count: completedJobs, color: "bg-green-500" },
    { status: "Cancelled", count: cancelledJobs, color: "bg-red-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color || ""}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown and Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Customers</span>
              </div>
              <Badge variant="outline">{uniqueCustomers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estimated Pipeline</span>
              </div>
              <Badge variant="outline">${estimatedRevenue.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">High Priority</span>
              </div>
              <Badge variant="outline">
                {jobs.filter((j) => j.priority === "high" || j.priority === "urgent").length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
