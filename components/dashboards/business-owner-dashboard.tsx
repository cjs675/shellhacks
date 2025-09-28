"use client"

import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Users, Plane, Calendar, Activity, BarChart3, PieChart } from "lucide-react"
import Link from "next/link"

export function BusinessOwnerDashboard() {
  const kpis = [
    {
      title: "Monthly Revenue",
      value: "$47,250",
      change: "+12.5%",
      description: "vs last month",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Active Customers",
      value: "23",
      change: "+3",
      description: "new this month",
      icon: Users,
      trend: "up",
    },
    {
      title: "Fleet Utilization",
      value: "87%",
      change: "+5%",
      description: "efficiency increase",
      icon: Plane,
      trend: "up",
    },
    {
      title: "Jobs Completed",
      value: "156",
      change: "+18%",
      description: "this month",
      icon: Calendar,
      trend: "up",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Executive Dashboard</h2>
          <p className="text-muted-foreground">
            Strategic overview of business performance, operations, and growth metrics.
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{kpi.change}</span>
                  <span className="text-muted-foreground">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Business Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="team">Team & Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Revenue chart visualization</p>
                      <p className="text-sm">Integration with analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Breakdown of services performed this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-4" />
                      <p>Service distribution chart</p>
                      <p className="text-sm">Integration with analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/analytics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Full Analytics
                    </CardTitle>
                    <CardDescription>Comprehensive business intelligence and reporting</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/billing">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Reports
                    </CardTitle>
                    <CardDescription>Revenue, expenses, and profitability analysis</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/fleet">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Fleet Overview
                    </CardTitle>
                    <CardDescription>Aircraft utilization and maintenance tracking</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                  <CardDescription>Current month performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-bold">$47,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding Invoices</span>
                      <span className="font-bold text-orange-600">$8,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Job Value</span>
                      <span className="font-bold">$1,245</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Net Profit Margin</span>
                      <span className="font-bold text-green-600">34.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>By revenue this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Executive Aviation LLC", revenue: "$12,450" },
                      { name: "Premier Jets Inc", revenue: "$8,750" },
                      { name: "Sky Charter Services", revenue: "$6,200" },
                    ].map((customer) => (
                      <div key={customer.name} className="flex justify-between">
                        <span className="text-sm">{customer.name}</span>
                        <span className="font-medium">{customer.revenue}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Fleet Status</CardTitle>
                  <CardDescription>Aircraft operational overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Aircraft</span>
                      <span className="font-bold">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operational</span>
                      <span className="font-bold text-green-600">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Service</span>
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization Rate</span>
                      <span className="font-bold">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Pipeline</CardTitle>
                  <CardDescription>Current and upcoming work</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Scheduled</span>
                      <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress</span>
                      <span className="font-bold text-blue-600">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Review</span>
                      <span className="font-bold text-orange-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Today</span>
                      <span className="font-bold text-green-600">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Metrics</CardTitle>
                  <CardDescription>Operational performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Avg. Job Duration</span>
                      <span className="font-bold">2.3 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-Time Completion</span>
                      <span className="font-bold text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Score</span>
                      <span className="font-bold text-green-600">96%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction</span>
                      <span className="font-bold text-green-600">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Individual and team metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "James Wilson", completed: 28, rating: 4.9 },
                      { name: "Maria Garcia", completed: 24, rating: 4.8 },
                      { name: "Robert Kim", completed: 22, rating: 4.7 },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.completed} jobs completed</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{member.rating}/5</p>
                          <p className="text-xs text-muted-foreground">Quality rating</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workforce Analytics</CardTitle>
                  <CardDescription>Team efficiency and capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Team Members</span>
                      <span className="font-bold">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Experience</span>
                      <span className="font-bold">3.2 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity Utilization</span>
                      <span className="font-bold text-blue-600">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Completion</span>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
