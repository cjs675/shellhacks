"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, DollarSign, FileText, TrendingUp, Calendar, Calculator } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns"

interface AccountingMetrics {
  totalRevenue: number
  totalJobs: number
  averageJobValue: number
  pendingInvoices: number
  paidInvoices: number
  overdueInvoices: number
  monthlyRevenue: { month: string; revenue: number; jobs: number }[]
  serviceBreakdown: { service: string; revenue: number; count: number }[]
  customerBreakdown: { customer: string; revenue: number; jobs: number }[]
}

interface ExportableData {
  invoices: any[]
  jobs: any[]
  payments: any[]
  summary: AccountingMetrics
}

export function AccountingExport() {
  const [metrics, setMetrics] = useState<AccountingMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("current_year")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exportFormat, setExportFormat] = useState("csv")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchAccountingMetrics()
  }, [dateRange, startDate, endDate])

  const getDateRange = () => {
    const now = new Date()
    switch (dateRange) {
      case "current_month":
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case "last_month":
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case "current_year":
        return { start: startOfYear(now), end: endOfYear(now) }
      case "custom":
        return {
          start: startDate ? new Date(startDate) : startOfYear(now),
          end: endDate ? new Date(endDate) : now
        }
      default:
        return { start: startOfYear(now), end: endOfYear(now) }
    }
  }

  const fetchAccountingMetrics = async () => {
    try {
      setLoading(true)
      const { start, end } = getDateRange()

      // Fetch invoices with job and customer data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          jobs!inner(
            *,
            aircraft!inner(tail_number, manufacturer, model),
            customers!inner(company_name, contact_name),
            job_services!inner(
              *,
              service_catalog!inner(service_name, service_category)
            )
          )
        `)
        .gte('invoice_date', start.toISOString().split('T')[0])
        .lte('invoice_date', end.toISOString().split('T')[0])
        .order('invoice_date', { ascending: false })

      if (invoicesError) throw invoicesError

      // Calculate metrics
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
      const totalJobs = new Set(invoices?.map(inv => inv.job_id)).size || 0
      const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0

      const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0
      const overdueInvoices = invoices?.filter(inv => {
        if (inv.status !== 'pending') return false
        const dueDate = new Date(inv.due_date)
        return dueDate < new Date()
      }).length || 0

      // Monthly revenue breakdown
      const monthlyData = new Map()
      invoices?.forEach(inv => {
        const month = format(new Date(inv.invoice_date), 'yyyy-MM')
        if (!monthlyData.has(month)) {
          monthlyData.set(month, { revenue: 0, jobs: new Set() })
        }
        const data = monthlyData.get(month)
        data.revenue += inv.total_amount || 0
        data.jobs.add(inv.job_id)
      })

      const monthlyRevenue = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        jobs: data.jobs.size
      })).sort((a, b) => a.month.localeCompare(b.month))

      // Service breakdown
      const serviceData = new Map()
      invoices?.forEach(inv => {
        inv.jobs.job_services.forEach((js: any) => {
          const serviceName = js.service_catalog.service_name
          if (!serviceData.has(serviceName)) {
            serviceData.set(serviceName, { revenue: 0, count: 0 })
          }
          const data = serviceData.get(serviceName)
          data.revenue += js.total_price || 0
          data.count += 1
        })
      })

      const serviceBreakdown = Array.from(serviceData.entries()).map(([service, data]) => ({
        service,
        revenue: data.revenue,
        count: data.count
      })).sort((a, b) => b.revenue - a.revenue)

      // Customer breakdown
      const customerData = new Map()
      invoices?.forEach(inv => {
        const customerName = inv.jobs.customers.company_name || inv.jobs.customers.contact_name
        if (!customerData.has(customerName)) {
          customerData.set(customerName, { revenue: 0, jobs: new Set() })
        }
        const data = customerData.get(customerName)
        data.revenue += inv.total_amount || 0
        data.jobs.add(inv.job_id)
      })

      const customerBreakdown = Array.from(customerData.entries()).map(([customer, data]) => ({
        customer,
        revenue: data.revenue,
        jobs: data.jobs.size
      })).sort((a, b) => b.revenue - a.revenue)

      setMetrics({
        totalRevenue,
        totalJobs,
        averageJobValue,
        pendingInvoices,
        paidInvoices,
        overdueInvoices,
        monthlyRevenue,
        serviceBreakdown,
        customerBreakdown
      })

    } catch (error) {
      console.error('Error fetching accounting metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const { start, end } = getDateRange()

      // Fetch detailed data for export
      const { data: invoices } = await supabase
        .from('invoices')
        .select(`
          invoice_number,
          invoice_date,
          due_date,
          subtotal,
          tax_amount,
          total_amount,
          status,
          payment_date,
          payment_method,
          jobs!inner(
            job_number,
            scheduled_start,
            scheduled_end,
            actual_start,
            actual_end,
            status as job_status,
            aircraft!inner(tail_number, manufacturer, model),
            customers!inner(company_name, contact_name, email),
            job_services!inner(
              quantity,
              unit_price,
              total_price,
              service_catalog!inner(service_name, service_category)
            )
          )
        `)
        .gte('invoice_date', start.toISOString().split('T')[0])
        .lte('invoice_date', end.toISOString().split('T')[0])

      const exportData: ExportableData = {
        invoices: invoices || [],
        jobs: [], // Extract from invoices
        payments: [], // Extract from invoices where paid
        summary: metrics!
      }

      if (format === 'csv') {
        exportToCSV(exportData)
      } else {
        exportToJSON(exportData)
      }

    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const exportToCSV = (data: ExportableData) => {
    const csvContent = [
      // Invoice summary
      'INVOICE SUMMARY',
      'Invoice Number,Date,Due Date,Customer,Aircraft,Amount,Status,Payment Date',
      ...data.invoices.map(inv => [
        inv.invoice_number,
        inv.invoice_date,
        inv.due_date,
        inv.jobs.customers.company_name || inv.jobs.customers.contact_name,
        inv.jobs.aircraft.tail_number,
        inv.total_amount,
        inv.status,
        inv.payment_date || ''
      ].join(',')),
      '',
      'SERVICE BREAKDOWN',
      'Service,Revenue,Count',
      ...data.summary.serviceBreakdown.map(s => [s.service, s.revenue, s.count].join(',')),
      '',
      'CUSTOMER BREAKDOWN',
      'Customer,Revenue,Jobs',
      ...data.summary.customerBreakdown.map(c => [c.customer, c.revenue, c.jobs].join(',')),
      '',
      'MONTHLY SUMMARY',
      'Month,Revenue,Jobs',
      ...data.summary.monthlyRevenue.map(m => [m.month, m.revenue, m.jobs].join(','))
    ].join('\n')

    downloadFile(csvContent, `accounting-export-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv')
  }

  const exportToJSON = (data: ExportableData) => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, `accounting-export-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json')
  }

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Accounting Export & Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => exportData(exportFormat as 'csv' | 'json')}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={fetchAccountingMetrics}>
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      {metrics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From {metrics.totalJobs} jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Job Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.averageJobValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per completed job</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.paidInvoices}</div>
                <p className="text-xs text-muted-foreground">Successfully collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.overdueInvoices > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {metrics.overdueInvoices} overdue
                    </Badge>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdowns */}
          <Tabs defaultValue="services" className="space-y-4">
            <TabsList>
              <TabsTrigger value="services">Service Breakdown</TabsTrigger>
              <TabsTrigger value="customers">Customer Breakdown</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.serviceBreakdown.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{service.service}</span>
                          <p className="text-sm text-muted-foreground">{service.count} services</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold">${service.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.customerBreakdown.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{customer.customer}</span>
                          <p className="text-sm text-muted-foreground">{customer.jobs} jobs</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold">${customer.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{format(new Date(month.month + '-01'), 'MMMM yyyy')}</span>
                          <p className="text-sm text-muted-foreground">{month.jobs} jobs</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold">${month.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}