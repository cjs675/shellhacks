"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  timeRange: string
}

export function RevenueChart({ timeRange }: RevenueChartProps) {
  // Mock data - in real app, this would come from Supabase
  const data = [
    { date: "2024-01-01", revenue: 12000 },
    { date: "2024-01-02", revenue: 15000 },
    { date: "2024-01-03", revenue: 8000 },
    { date: "2024-01-04", revenue: 22000 },
    { date: "2024-01-05", revenue: 18000 },
    { date: "2024-01-06", revenue: 25000 },
    { date: "2024-01-07", revenue: 20000 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Daily revenue over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
