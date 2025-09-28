"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, FileText, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_amount: number
  due_date: string | null
  paid_date: string | null
  created_at: string
}

interface Customer {
  id: string
  company_name: string | null
  contact_name: string
  email: string
}

interface BillingOverviewProps {
  invoices: Invoice[]
  customers: Customer[]
}

export function BillingOverview({ invoices, customers }: BillingOverviewProps) {
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter((i) => i.status === "paid").length
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length
  const overdueInvoices = invoices.filter((i) => {
    if (i.status !== "pending" || !i.due_date) return false
    return new Date(i.due_date) < new Date()
  }).length

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total_amount, 0)

  const pendingRevenue = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, invoice) => sum + invoice.total_amount, 0)

  const overdueAmount = invoices
    .filter((i) => {
      if (i.status !== "pending" || !i.due_date) return false
      return new Date(i.due_date) < new Date()
    })
    .reduce((sum, invoice) => sum + invoice.total_amount, 0)

  // Calculate this month's revenue
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthRevenue = invoices
    .filter((i) => {
      if (i.status !== "paid" || !i.paid_date) return false
      const paidDate = new Date(i.paid_date)
      return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
    })
    .reduce((sum, invoice) => sum + invoice.total_amount, 0)

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "All time",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "This Month",
      value: `$${thisMonthRevenue.toLocaleString()}`,
      description: "Current month revenue",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: `$${pendingRevenue.toLocaleString()}`,
      description: `${pendingInvoices} invoices`,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Overdue",
      value: `$${overdueAmount.toLocaleString()}`,
      description: `${overdueInvoices} invoices`,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ]

  const invoiceStatusBreakdown = [
    { status: "Paid", count: paidInvoices, color: "bg-green-500" },
    { status: "Pending", count: pendingInvoices, color: "bg-orange-500" },
    { status: "Overdue", count: overdueInvoices, color: "bg-red-500" },
    { status: "Draft", count: invoices.filter((i) => i.status === "draft").length, color: "bg-gray-500" },
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

      {/* Status Breakdown and Customer Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoiceStatusBreakdown.map((item) => (
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
            <CardTitle className="text-lg">Customer Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Customers</span>
              </div>
              <Badge variant="outline">{customers.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Invoices</span>
              </div>
              <Badge variant="outline">{totalInvoices}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment Rate</span>
              </div>
              <Badge variant="outline">
                {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
