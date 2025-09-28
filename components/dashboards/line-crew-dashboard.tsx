"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { LiveFlightsWidget } from "@/components/tracking/live-flights-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TaskCompletionDialog } from "@/components/tasks/task-completion-dialog"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { CheckCircle, Clock, AlertCircle, Calendar, Wrench, FileText, Plane, User } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface TaskItem {
  id: string
  title: string
  description: string
  status: string
  estimated_duration: number
  sequence_order: number
  notes: string
  completed_at: string
  job: {
    id: string
    aircraft: {
      tail_number: string
      model: string
    }
    customer: {
      name: string
    }
    scheduled_date: string
  }
  service: {
    name: string
  }
}

export function LineCrewDashboard() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMyTasks()
  }, [])

  const fetchMyTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("task_items")
        .select(`
          *,
          job:jobs!inner(
            id,
            scheduled_date,
            aircraft:aircraft(tail_number, model),
            customer:customers(name)
          ),
          service:services(name)
        `)
        .eq("job.assigned_to", profile?.id)
        .in("status", ["pending", "in_progress", "completed_pending_review", "approved", "rejected"])
        .order("sequence_order")

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskAction = (task: TaskItem) => {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  const handleTaskUpdated = () => {
    fetchMyTasks()
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const completedTasks = getTasksByStatus("approved").length
  const pendingReviewTasks = getTasksByStatus("completed_pending_review").length
  const inProgressTasks = getTasksByStatus("in_progress").length
  const pendingTasks = getTasksByStatus("pending").length
  const totalTasks = tasks.length

  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getTaskPriority = (task: TaskItem) => {
    const scheduledDate = new Date(task.job.scheduled_date)
    const today = new Date()
    const diffInDays = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) return "overdue"
    if (diffInDays === 0) return "today"
    if (diffInDays === 1) return "tomorrow"
    return "upcoming"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "overdue":
        return "border-l-red-500 bg-red-50"
      case "today":
        return "border-l-orange-500 bg-orange-50"
      case "tomorrow":
        return "border-l-yellow-500 bg-yellow-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "overdue":
        return "Overdue"
      case "today":
        return "Due Today"
      case "tomorrow":
        return "Due Tomorrow"
      default:
        return "Upcoming"
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">Here are your assigned tasks and current progress.</p>
        </div>

        {/* Progress Overview and Live Flights */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">Ready to start</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Wrench className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressTasks}</div>
                  <p className="text-xs text-muted-foreground">Currently working</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingReviewTasks}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                  <Progress value={progressPercentage} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <LiveFlightsWidget maxFlights={4} compact={true} />
          </div>
        </div>

        {/* Current Tasks */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Your Current Tasks</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">All caught up!</h4>
                <p className="text-muted-foreground">No pending tasks at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Active Tasks (Pending and In Progress) */}
              {tasks
                .filter((task) => ["pending", "in_progress"].includes(task.status))
                .map((task) => {
                  const priority = getTaskPriority(task)
                  return (
                    <Card
                      key={task.id}
                      className={`hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(priority)}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {getPriorityLabel(priority)}
                              </Badge>
                            </div>
                            <CardDescription className="mb-3">{task.description}</CardDescription>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Plane className="h-3 w-3" />
                                {task.job.aircraft.tail_number} ({task.job.aircraft.model})
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.job.customer.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Est. {task.estimated_duration} min
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <TaskStatusBadge status={task.status} />
                            <span className="text-xs text-muted-foreground">Step {task.sequence_order}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          {task.status === "pending" && (
                            <Button size="sm" onClick={() => handleTaskAction(task)}>
                              <Wrench className="h-4 w-4 mr-2" />
                              Start Task
                            </Button>
                          )}
                          {task.status === "in_progress" && (
                            <Button size="sm" onClick={() => handleTaskAction(task)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

              {/* Completed Tasks (Pending Review and Approved) */}
              {tasks.filter((task) => ["completed_pending_review", "approved", "rejected"].includes(task.status))
                .length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4">Recently Completed</h4>
                  <div className="space-y-3">
                    {tasks
                      .filter((task) => ["completed_pending_review", "approved", "rejected"].includes(task.status))
                      .slice(0, 5)
                      .map((task) => (
                        <Card key={task.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium">{task.title}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {task.job.aircraft.tail_number} • {task.job.customer.name}
                                </p>
                                {task.completed_at && (
                                  <p className="text-xs text-muted-foreground">
                                    Completed: {new Date(task.completed_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <TaskStatusBadge status={task.status} />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  View SOPs
                </CardTitle>
                <CardDescription>Access standard operating procedures and guidelines</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Schedule
                </CardTitle>
                <CardDescription>View your upcoming assignments and schedule</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Report Issue
                </CardTitle>
                <CardDescription>Report equipment issues or safety concerns</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Completion Dialog */}
      {selectedTask && (
        <TaskCompletionDialog
          task={selectedTask}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </main>
  )
}
