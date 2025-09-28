"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Eye, User, Calendar } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface PendingTask {
  id: string
  title: string
  description: string
  status: string
  completed_at: string
  notes: string
  sequence_order: number
  completed_by: {
    id: string
    full_name: string
    employee_id: string
  }
  job: {
    id: string
    scheduled_date: string
    aircraft: {
      tail_number: string
      model: string
    }
    customer: {
      name: string
    }
  }
  service: {
    name: string
    base_price: number
  }
}

export default function ApprovalsPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "business_owner"]}>
      <ApprovalsContent />
    </ProtectedRoute>
  )
}

function ApprovalsContent() {
  const { profile } = useAuth()
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchPendingTasks()
  }, [])

  const fetchPendingTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("task_items")
        .select(`
          *,
          completed_by:users!task_items_completed_by_fkey(id, full_name, employee_id),
          job:jobs!inner(
            id,
            scheduled_date,
            aircraft:aircraft(tail_number, model),
            customer:customers(name)
          ),
          service:services(name, base_price)
        `)
        .eq("status", "completed_pending_review")
        .order("completed_at", { ascending: false })

      if (error) throw error
      setPendingTasks(data || [])
    } catch (error) {
      console.error("Error fetching pending tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (taskId: string, approved: boolean) => {
    if (!profile) return

    setSubmitting(true)
    try {
      const newStatus = approved ? "approved" : "rejected"
      const { error } = await supabase
        .from("task_items")
        .update({
          status: newStatus,
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes || null,
        })
        .eq("id", taskId)

      if (error) throw error

      // Log the activity
      await supabase.rpc("log_activity", {
        p_action: approved ? "task_approved" : "task_rejected",
        p_resource_type: "task_item",
        p_resource_id: taskId,
        p_new_values: { status: newStatus, reviewed_by: profile.id },
      })

      // Refresh the list
      await fetchPendingTasks()
      setSelectedTask(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Task Approvals</h2>
          <p className="text-muted-foreground">Review and approve completed tasks from your line crew team.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">Tasks awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  pendingTasks.filter((task) => {
                    const completedHours = Math.floor(
                      (new Date().getTime() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60),
                    )
                    return completedHours > 24
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Over 24 hours old</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2h</div>
              <p className="text-xs text-muted-foreground">Typical approval time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Task List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasks Pending Review</CardTitle>
                <CardDescription>Click on a task to review details and approve/reject</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading pending tasks...</p>
                  </div>
                ) : pendingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">All caught up!</h4>
                    <p className="text-muted-foreground">No tasks pending review at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTasks.map((task) => {
                      const isUrgent =
                        Math.floor((new Date().getTime() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60)) >
                        24
                      const isSelected = selectedTask?.id === task.id

                      return (
                        <div
                          key={task.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
                          } ${isUrgent ? "border-l-4 border-l-red-500" : ""}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{task.title}</h4>
                                {isUrgent && (
                                  <Badge variant="destructive" className="text-xs">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {task.completed_by.full_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {task.job.aircraft.tail_number}
                                </span>
                                <span>{getTimeAgo(task.completed_at)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-orange-100 text-orange-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Review
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">Step {task.sequence_order}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Review Task</CardTitle>
                <CardDescription>
                  {selectedTask ? "Review details and approve or reject" : "Select a task to review"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTask ? (
                  <div className="space-y-6">
                    {/* Task Details */}
                    <div>
                      <h4 className="font-semibold mb-2">{selectedTask.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{selectedTask.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aircraft:</span>
                          <span>
                            {selectedTask.job.aircraft.tail_number} ({selectedTask.job.aircraft.model})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer:</span>
                          <span>{selectedTask.job.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service:</span>
                          <span>{selectedTask.service.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completed by:</span>
                          <span>{selectedTask.completed_by.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completed:</span>
                          <span>{getTimeAgo(selectedTask.completed_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Technician Notes */}
                    {selectedTask.notes && (
                      <div>
                        <Label className="text-sm font-medium">Technician Notes</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedTask.notes}</div>
                      </div>
                    )}

                    {/* Review Notes */}
                    <div>
                      <Label htmlFor="review-notes" className="text-sm font-medium">
                        Review Notes (Optional)
                      </Label>
                      <Textarea
                        id="review-notes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add any feedback or notes about this task..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproval(selectedTask.id, false)}
                        variant="destructive"
                        className="flex-1"
                        disabled={submitting}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApproval(selectedTask.id, true)}
                        className="flex-1"
                        disabled={submitting}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a task from the list to review its details and approve or reject it.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
