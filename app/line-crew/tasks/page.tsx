"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskCompletionDialog } from "@/components/tasks/task-completion-dialog"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { Search, Filter, Plane, User, Clock, Calendar } from "lucide-react"
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

export default function TasksPage() {
  return (
    <ProtectedRoute requiredRole="line_crew">
      <TasksContent />
    </ProtectedRoute>
  )
}

function TasksContent() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchMyTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter])

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
        .order("sequence_order")

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.job.aircraft.tail_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    setFilteredTasks(filtered)
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

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">My Tasks</h2>
          <p className="text-muted-foreground">View and manage all your assigned tasks across different jobs.</p>
        </div>

        {/* Task Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus("pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus("in_progress").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus("completed_pending_review").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTasksByStatus("approved").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks, aircraft, or customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed_pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>All your assigned tasks across different jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" ? "No tasks match your filters." : "No tasks assigned yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          <span className="text-xs text-muted-foreground">Step {task.sequence_order}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.job.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <TaskStatusBadge status={task.status} />
                        <div className="flex gap-2">
                          {(task.status === "pending" || task.status === "in_progress") && (
                            <Button size="sm" onClick={() => handleTaskAction(task)}>
                              {task.status === "pending" ? "Start" : "Complete"}
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
