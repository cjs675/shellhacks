"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface JobsChartProps {
  timeRange: string
}

export function JobsChart({ timeRange }: JobsChartProps) {
  // Mock data - in real app, this would come from Supabase
  const data = [
    { date: "2024-01-01", completed: 5, pending: 3, cancelled: 1 },
    { date: "2024-01-02", completed: 7, pending: 2, cancelled: 0 },
    { date: "2024-01-03", completed: 4, pending: 4, cancelled: 1 },
    { date: "2024-01-04", completed: 9, pending: 1, cancelled: 0 },
    { date: "2024-01-05", completed: 6, pending: 3, cancelled: 2 },
    { date: "2024-01-06", completed: 8, pending: 2, cancelled: 0 },
    { date: "2024-01-07", completed: 7, pending: 4, cancelled: 1 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs Overview</CardTitle>
        <CardDescription>Job completion status over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
            <YAxis />
            <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name="Completed" />
            <Bar dataKey="pending" stackId="a" fill="hsl(var(--muted))" name="Pending" />
            <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--destructive))" name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
