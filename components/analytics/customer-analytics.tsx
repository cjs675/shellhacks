"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"

export function CustomerAnalytics() {
  // Mock data - in real app, this would come from Supabase
  const customerData = [
    { name: "Skyline Aviation", value: 35, revenue: 125000, jobs: 18 },
    { name: "Elite Jets", value: 25, revenue: 89000, jobs: 12 },
    { name: "Premier Flight Services", value: 20, revenue: 67000, jobs: 9 },
    { name: "Corporate Air", value: 12, revenue: 45000, jobs: 7 },
    { name: "Others", value: 8, revenue: 28000, jobs: 4 },
  ]

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
    "hsl(var(--border))",
  ]

  const topCustomers = [
    { name: "Skyline Aviation", revenue: 125000, jobs: 18, growth: 15.2 },
    { name: "Elite Jets", revenue: 89000, jobs: 12, growth: 8.7 },
    { name: "Premier Flight Services", revenue: 67000, jobs: 9, growth: 22.1 },
    { name: "Corporate Air", revenue: 45000, jobs: 7, growth: -3.2 },
    { name: "Apex Aviation", revenue: 38000, jobs: 5, growth: 45.8 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Customer Distribution</CardTitle>
          <CardDescription>Revenue share by customer</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Highest revenue generating customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.jobs} jobs</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${customer.revenue.toLocaleString()}</div>
                  <div className={`text-xs ${customer.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                    {customer.growth > 0 ? "+" : ""}
                    {customer.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
