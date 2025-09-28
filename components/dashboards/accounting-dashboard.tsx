"use client"

import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, FileText, AlertCircle, TrendingUp, CreditCard, Receipt, PieChart } from "lucide-react"
import Link from "next/link"

export function AccountingDashboard() {
  const financialMetrics = [
    {
      title: "Outstanding Invoices",
      value: "$18,450",
      count: "12 invoices",
      description: "Awaiting payment",
      icon: FileText,
      color: "text-orange-600",
      urgent: true,
    },
    {
      title: "Monthly Revenue",
      value: "$47,250",
      count: "156 jobs",
      description: "Current month",
      icon: DollarSign,
      color: "text-green-600",
      urgent: false,
    },
    {
      title: "Overdue Payments",
      value: "$5,200",
      count: "3 invoices",
      description: "Past due date",
      icon: AlertCircle,
      color: "text-red-600",
      urgent: true,
    },
    {
      title: "Average Collection",
      value: "18 days",
      count: "Improved",
      description: "Payment cycle",
      icon: TrendingUp,
      color: "text-blue-600",
      urgent: false,
    },
  ]

  const recentInvoices = [
    {
      id: "INV-2024-001",
      customer: "Executive Aviation LLC",
      amount: "$3,450",
      status: "paid",
      dueDate: "2024-01-15",
    },
    {
      id: "INV-2024-002",
      customer: "Premier Jets Inc",
      amount: "$2,750",
      status: "overdue",
      dueDate: "2024-01-10",
    },
    {
      id: "INV-2024-003",
      customer: "Sky Charter Services",
      amount: "$1,890",
      status: "pending",
      dueDate: "2024-01-25",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Accounting Dashboard</h2>
          <p className="text-muted-foreground">
            Financial overview, invoice management, and payment tracking for aircraft detailing operations.
          </p>
        </div>

        {/* Financial Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {financialMetrics.map((metric) => (
            <Card key={metric.title} className={metric.urgent ? "border-orange-200" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {metric.urgent && <AlertCircle className="h-3 w-3 text-orange-600" />}
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{metric.count}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
            <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
            <TabsTrigger value="customers">Customer Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest billing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                          <p className="text-xs text-muted-foreground">Due: {invoice.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{invoice.amount}</p>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/billing">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Invoices
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common accounting tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Receipt className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Send Payment Reminder
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <PieChart className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overdue Invoices</CardTitle>
                <CardDescription>Requires immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentInvoices
                    .filter((inv) => inv.status === "overdue")
                    .map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-red-900">{invoice.id}</p>
                          <p className="text-sm text-red-700">{invoice.customer}</p>
                          <p className="text-xs text-red-600">Overdue since: {invoice.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-900">{invoice.amount}</span>
                          <Button size="sm" variant="destructive">
                            Follow Up
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Current month overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Received</span>
                      <span className="font-bold text-green-600">$42,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Payments</span>
                      <span className="font-bold text-orange-600">$18,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Payment Time</span>
                      <span className="font-bold">18 days</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Collection Rate</span>
                      <span className="font-bold text-green-600">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>How customers pay</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit Card
                      </span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Bank Transfer
                      </span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Check
                      </span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Monthly P&L
                  </CardTitle>
                  <CardDescription>Profit and loss statement</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Analysis
                  </CardTitle>
                  <CardDescription>Revenue trends and forecasting</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Customer Report
                  </CardTitle>
                  <CardDescription>Customer payment behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Account Status</CardTitle>
                <CardDescription>Payment history and account standing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Executive Aviation LLC", balance: "$0", status: "good", lastPayment: "On time" },
                    { name: "Premier Jets Inc", balance: "$2,750", status: "overdue", lastPayment: "15 days late" },
                    { name: "Sky Charter Services", balance: "$1,890", status: "pending", lastPayment: "Current" },
                  ].map((customer) => (
                    <div key={customer.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">Last payment: {customer.lastPayment}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{customer.balance}</p>
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                      </div>
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
