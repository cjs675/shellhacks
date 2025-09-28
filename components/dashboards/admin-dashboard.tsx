"use client"

import { useState } from "react"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { AccountingExport } from "@/components/accounting/accounting-export"
import { LiveFlightsWidget } from "@/components/tracking/live-flights-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, Plane, Calendar, DollarSign, Activity, FileText } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState(8)
  const [activeJobs, setActiveJobs] = useState(12)
  const [teamMembers, setTeamMembers] = useState(6)

  const quickStats = [
    {
      title: "Pending Approvals",
      value: pendingApprovals.toString(),
      description: "Tasks awaiting review",
      icon: Clock,
      href: "/admin/approvals",
      color: "text-orange-600",
    },
    {
      title: "Active Jobs",
      value: activeJobs.toString(),
      description: "In progress",
      icon: Activity,
      href: "/jobs",
      color: "text-blue-600",
    },
    {
      title: "Team Members",
      value: teamMembers.toString(),
      description: "Line crew active",
      icon: Users,
      href: "/admin/users",
      color: "text-green-600",
    },
    {
      title: "Fleet Status",
      value: "5/5",
      description: "Aircraft operational",
      icon: Plane,
      href: "/fleet",
      color: "text-purple-600",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "Task completed by James Wilson",
      details: "Full Interior - N123CL",
      time: "5 minutes ago",
      status: "pending_review",
    },
    {
      id: 2,
      action: "New job assigned to Maria Garcia",
      details: "Exterior Wash - N456LR",
      time: "15 minutes ago",
      status: "assigned",
    },
    {
      id: 3,
      action: "Task approved by Sarah Johnson",
      details: "Brightwork - N789CH",
      time: "1 hour ago",
      status: "approved",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage operations, review tasks, and oversee team performance.</p>
        </div>

        {/* Quick Stats and Live Flights */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickStats.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <LiveFlightsWidget maxFlights={4} compact={true} />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="approvals">Task Approvals</TabsTrigger>
            <TabsTrigger value="team">Team Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks Pending Review</CardTitle>
                <CardDescription>Review and approve completed tasks from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">Full Interior Cleaning</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed by James Wilson • N123CL Challenger 350
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted 2 hours ago</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/admin/approvals">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Pending Approvals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Current week overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasks Completed</span>
                      <Badge variant="secondary">24</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Completion Time</span>
                      <Badge variant="secondary">2.3 hrs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality Score</span>
                      <Badge className="bg-green-100 text-green-800">95%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Team Members</CardTitle>
                  <CardDescription>Currently on duty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["James Wilson", "Maria Garcia", "Robert Kim"].map((name) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm">{name}</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/fleet">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Fleet Management
                    </CardTitle>
                    <CardDescription>Manage aircraft and tracking settings</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/jobs">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Job Scheduling
                    </CardTitle>
                    <CardDescription>Schedule and assign detailing jobs</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tracking">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Flight Tracking
                    </CardTitle>
                    <CardDescription>Monitor aircraft locations and status</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="accounting" className="space-y-4">
            <AccountingExport />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge
                        className={
                          activity.status === "pending_review"
                            ? "bg-orange-100 text-orange-800"
                            : activity.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {activity.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
