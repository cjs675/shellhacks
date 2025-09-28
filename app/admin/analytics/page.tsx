"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  averageCompletionTime: number
  teamPerformance: Array<{
    user_id: string
    full_name: string
    completed_tasks: number
    average_time: number
    quality_score: number
  }>
  tasksByStatus: Array<{
    status: string
    count: number
  }>
  dailyActivity: Array<{
    date: string
    tasks_completed: number
    tasks_started: number
  }>
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "business_owner"]}>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}

function AnalyticsContent() {
  const { profile } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(timeRange))

      // Fetch task statistics
      const { data: tasks, error: tasksError } = await supabase
        .from("task_items")
        .select("*, completed_by:users(full_name)")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (tasksError) throw tasksError

      // Fetch team performance data
      const { data: teamData, error: teamError } = await supabase
        .from("users")
        .select("id, full_name, role")
        .eq("role", "line_crew")

      if (teamError) throw teamError

      // Process analytics data
      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter((t) => t.status === "approved").length || 0
      const pendingTasks = tasks?.filter((t) => ["pending", "in_progress"].includes(t.status)).length || 0

      // Calculate average completion time (mock data for now)
      const averageCompletionTime = 4.2

      // Team performance (mock data enhanced with real user data)
      const teamPerformance =
        teamData?.map((user) => ({
          user_id: user.id,
          full_name: user.full_name,
          completed_tasks: tasks?.filter((t) => t.completed_by === user.id && t.status === "approved").length || 0,
          average_time: Math.random() * 2 + 3, // Mock: 3-5 hours
          quality_score: Math.random() * 10 + 90, // Mock: 90-100%
        })) || []

      // Tasks by status
      const statusCounts = tasks?.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const tasksByStatus = Object.entries(statusCounts || {}).map(([status, count]) => ({
        status,
        count,
      }))

      // Daily activity (mock data for visualization)
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
          date: date.toISOString().split("T")[0],
          tasks_completed: Math.floor(Math.random() * 10) + 5,
          tasks_started: Math.floor(Math.random() * 8) + 3,
        }
      }).reverse()

      setAnalytics({
        totalTasks,
        completedTasks,
        pendingTasks,
        averageCompletionTime,
        teamPerformance,
        tasksByStatus,
        dailyActivity,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCompletionRate = () => {
    if (!analytics || analytics.totalTasks === 0) return 0
    return Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "completed_pending_review":
        return "bg-orange-100 text-orange-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Performance insights and operational metrics.</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalTasks || 0}</div>
                  <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCompletionRate()}%</div>
                  <p className="text-xs text-muted-foreground">{analytics?.completedTasks} completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.averageCompletionTime || 0}h</div>
                  <p className="text-xs text-muted-foreground">Per task average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.pendingTasks || 0}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Team Performance</TabsTrigger>
                <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance Overview</CardTitle>
                    <CardDescription>Individual performance metrics for line crew members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.teamPerformance.map((member) => (
                        <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{member.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{member.completed_tasks} tasks completed</p>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-bold">{member.average_time.toFixed(1)}h</p>
                              <p className="text-muted-foreground">Avg. Time</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-green-600">{member.quality_score.toFixed(1)}%</p>
                              <p className="text-muted-foreground">Quality</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tasks by Status</CardTitle>
                      <CardDescription>Current distribution of task statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics?.tasksByStatus.map((item) => (
                          <div key={item.status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(item.status).split(" ")[0]}`}
                              ></div>
                              <span className="capitalize">{item.status.replace("_", " ")}</span>
                            </div>
                            <span className="font-bold">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Task Categories</CardTitle>
                      <CardDescription>Breakdown by service type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Interior Cleaning</span>
                          <span className="font-bold">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Exterior Wash</span>
                          <span className="font-bold">30%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Brightwork</span>
                          <span className="font-bold">15%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Other Services</span>
                          <span className="font-bold">10%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity Trends</CardTitle>
                    <CardDescription>Task completion patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.dailyActivity.map((day) => (
                        <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">✓ {day.tasks_completed} completed</span>
                            <span className="text-blue-600">→ {day.tasks_started} started</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Scores</CardTitle>
                      <CardDescription>Average quality ratings by service type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Interior Cleaning</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                            </div>
                            <span className="text-sm font-bold">95%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Exterior Wash</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                            </div>
                            <span className="text-sm font-bold">92%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Brightwork</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "88%" }}></div>
                            </div>
                            <span className="text-sm font-bold">88%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rejection Reasons</CardTitle>
                      <CardDescription>Common reasons for task rejections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Incomplete work</span>
                          <span className="font-bold text-red-600">35%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Quality issues</span>
                          <span className="font-bold text-red-600">28%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Missing documentation</span>
                          <span className="font-bold text-red-600">22%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Safety concerns</span>
                          <span className="font-bold text-red-600">15%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  )
}
