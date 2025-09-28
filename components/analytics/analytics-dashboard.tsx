"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, DollarSignIcon, PlaneIcon, UsersIcon, ClockIcon } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { RevenueChart } from "./revenue-chart"
import { JobsChart } from "./jobs-chart"
import { FleetUtilization } from "./fleet-utilization"
import { CustomerAnalytics } from "./customer-analytics"
import { ActivityFeed } from "./activity-feed"

interface AnalyticsData {
  totalRevenue: number
  monthlyRevenue: number
  totalJobs: number
  completedJobs: number
  activeAircraft: number
  totalCustomers: number
  avgJobDuration: number
  revenueGrowth: number
  jobsGrowth: number
  topServices: Array<{ name: string; count: number; revenue: number }>
  recentActivity: Array<{ id: string; type: string; description: string; timestamp: string }>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      startDate.setDate(endDate.getDate() - days)

      // Fetch jobs data
      const { data: jobs } = await supabase
        .from("jobs")
        .select(`
          *,
          aircraft:aircraft_id(tail_number, aircraft_type),
          customer:customer_id(company_name),
          services:job_services(
            service:service_id(name, base_price)
          )
        `)
        .gte("created_at", startDate.toISOString())

      // Fetch invoices data
      const { data: invoices } = await supabase.from("invoices").select("*").gte("created_at", startDate.toISOString())

      // Fetch aircraft data
      const { data: aircraft } = await supabase.from("aircraft").select("*")

      // Fetch customers data
      const { data: customers } = await supabase.from("customers").select("*")

      // Calculate metrics
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
      const completedJobs = jobs?.filter((job) => job.status === "completed").length || 0
      const avgJobDuration = jobs?.length
        ? jobs.reduce((sum, job) => {
            if (job.actual_end_time && job.actual_start_time) {
              const duration = new Date(job.actual_end_time).getTime() - new Date(job.actual_start_time).getTime()
              return sum + duration / (1000 * 60 * 60) // Convert to hours
            }
            return sum
          }, 0) / completedJobs
        : 0

      // Calculate growth (mock data for now)
      const revenueGrowth = Math.random() * 20 + 5 // 5-25% growth
      const jobsGrowth = Math.random() * 15 + 2 // 2-17% growth

      // Top services analysis
      const serviceStats = new Map()
      jobs?.forEach((job) => {
        job.services?.forEach((js: any) => {
          const serviceName = js.service?.name || "Unknown"
          const current = serviceStats.get(serviceName) || { count: 0, revenue: 0 }
          serviceStats.set(serviceName, {
            count: current.count + 1,
            revenue: current.revenue + (js.service?.base_price || 0),
          })
        })
      })

      const topServices = Array.from(serviceStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Recent activity (mock data)
      const recentActivity = [
        {
          id: "1",
          type: "job_completed",
          description: "Interior detailing completed for N123AB",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "2",
          type: "invoice_paid",
          description: "Invoice #INV-001 paid by Skyline Aviation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: "3",
          type: "job_started",
          description: "Exterior wash started for N456CD",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
        {
          id: "4",
          type: "aircraft_added",
          description: "New aircraft N789EF added to fleet",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        },
        {
          id: "5",
          type: "customer_added",
          description: "New customer Elite Jets registered",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        },
      ]

      setData({
        totalRevenue,
        monthlyRevenue: totalRevenue,
        totalJobs: jobs?.length || 0,
        completedJobs,
        activeAircraft: aircraft?.filter((a) => a.tracking_enabled).length || 0,
        totalCustomers: customers?.length || 0,
        avgJobDuration,
        revenueGrowth,
        jobsGrowth,
        topServices,
        recentActivity,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64">Failed to load analytics data</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Time Range:</span>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.revenueGrowth.toFixed(1)}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.jobsGrowth.toFixed(1)}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Aircraft</CardTitle>
            <PlaneIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeAircraft}</div>
            <p className="text-xs text-muted-foreground">Currently being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart timeRange={timeRange} />
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
                <CardDescription>Most popular services by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${service.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{service.count} jobs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <JobsChart timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <FleetUtilization />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerAnalytics />
        </TabsContent>
      </Tabs>

      {/* Activity Feed */}
      <ActivityFeed activities={data.recentActivity} />
    </div>
  )
}
