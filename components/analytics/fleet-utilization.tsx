"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function FleetUtilization() {
  // Mock data - in real app, this would come from Supabase
  const fleetData = [
    { tailNumber: "N123AB", type: "Citation CJ3+", utilization: 85, jobs: 12, revenue: 45000 },
    { tailNumber: "N456CD", type: "Gulfstream G650", utilization: 72, jobs: 8, revenue: 62000 },
    { tailNumber: "N789EF", type: "King Air 350", utilization: 91, jobs: 15, revenue: 38000 },
    { tailNumber: "N101GH", type: "Falcon 7X", utilization: 68, jobs: 9, revenue: 55000 },
    { tailNumber: "N202IJ", type: "Citation Mustang", utilization: 45, jobs: 6, revenue: 22000 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization</CardTitle>
          <CardDescription>Aircraft usage and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fleetData.map((aircraft) => (
              <div key={aircraft.tailNumber} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{aircraft.tailNumber}</div>
                    <div className="text-sm text-muted-foreground">{aircraft.type}</div>
                  </div>
                  <Badge
                    variant={
                      aircraft.utilization > 80 ? "default" : aircraft.utilization > 60 ? "secondary" : "outline"
                    }
                  >
                    {aircraft.utilization}%
                  </Badge>
                </div>
                <Progress value={aircraft.utilization} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{aircraft.jobs} jobs</span>
                  <span>${aircraft.revenue.toLocaleString()} revenue</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Performance</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Utilization</span>
              <span className="text-2xl font-bold">72%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Fleet Revenue</span>
              <span className="text-2xl font-bold">$222k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Most Active Aircraft</span>
              <Badge>N789EF</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Highest Revenue</span>
              <Badge>N456CD</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
