"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface ScheduledJob {
  id: string
  scheduled_date: string
  estimated_duration: number
  status: string
  aircraft: {
    tail_number: string
    model: string
    location: string
  }
  customer: {
    name: string
    contact_email: string
  }
  services: Array<{
    name: string
    base_price: number
  }>
  task_items: Array<{
    id: string
    title: string
    status: string
    sequence_order: number
  }>
}

export default function SchedulePage() {
  return (
    <ProtectedRoute requiredRole="line_crew">
      <ScheduleContent />
    </ProtectedRoute>
  )
}

function ScheduleContent() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMySchedule()
  }, [])

  const fetchMySchedule = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          aircraft:aircraft(tail_number, model, location),
          customer:customers(name, contact_email),
          services:job_services(service:services(name, base_price)),
          task_items(id, title, status, sequence_order)
        `)
        .eq("assigned_to", profile?.id)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date")

      if (error) throw error

      // Transform the data to flatten services
      const transformedJobs = (data || []).map((job) => ({
        ...job,
        services: job.services?.map((js: any) => js.service) || [],
      }))

      setJobs(transformedJobs)
    } catch (error) {
      console.error("Error fetching schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskProgress = (tasks: any[]) => {
    const completedTasks = tasks.filter((task) => task.status === "approved").length
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const groupJobsByDate = (jobs: ScheduledJob[]) => {
    const grouped: { [key: string]: ScheduledJob[] } = {}
    jobs.forEach((job) => {
      const dateKey = job.scheduled_date.split("T")[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(job)
    })
    return grouped
  }

  const groupedJobs = groupJobsByDate(jobs)

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">My Schedule</h2>
          <p className="text-muted-foreground">Your upcoming job assignments and scheduled tasks.</p>
        </div>

        {/* Schedule Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  jobs.filter((job) => {
                    const jobDate = new Date(job.scheduled_date)
                    const weekFromNow = new Date()
                    weekFromNow.setDate(weekFromNow.getDate() + 7)
                    return jobDate <= weekFromNow
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Jobs scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(jobs.reduce((total, job) => total + (job.estimated_duration || 0), 0) / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">Estimated work</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your schedule...</p>
            </div>
          ) : Object.keys(groupedJobs).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No upcoming jobs</h4>
                <p className="text-muted-foreground">Your schedule is clear for the next 30 days.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedJobs).map(([date, dayJobs]) => (
              <div key={date}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(dayJobs[0].scheduled_date)}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({new Date(date).toLocaleDateString()})
                  </span>
                </h3>
                <div className="space-y-4">
                  {dayJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">
                                {job.aircraft.tail_number} - {job.services.map((s) => s.name).join(", ")}
                              </CardTitle>
                              <Badge className={getJobStatusColor(job.status)}>{job.status}</Badge>
                            </div>
                            <CardDescription className="mb-3">
                              {job.aircraft.model} • {job.customer.name}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(job.scheduled_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.aircraft.location || "Location TBD"}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {job.customer.contact_email}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {Math.round((job.estimated_duration || 0) / 60)}h {(job.estimated_duration || 0) % 60}m
                            </p>
                            <p className="text-xs text-muted-foreground">Estimated duration</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Task Progress</span>
                              <span className="text-sm text-muted-foreground">
                                {job.task_items.filter((t) => t.status === "approved").length} of{" "}
                                {job.task_items.length} completed
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${getTaskProgress(job.task_items)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {job.task_items
                              .sort((a, b) => a.sequence_order - b.sequence_order)
                              .slice(0, 5)
                              .map((task) => (
                                <Badge
                                  key={task.id}
                                  variant="outline"
                                  className={`text-xs ${
                                    task.status === "approved"
                                      ? "bg-green-50 text-green-700"
                                      : task.status === "in_progress"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  {task.sequence_order}. {task.title}
                                </Badge>
                              ))}
                            {job.task_items.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.task_items.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
