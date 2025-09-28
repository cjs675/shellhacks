"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, DollarSignIcon, PlayIcon, PlusIcon, UserPlusIcon } from "lucide-react"

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case "invoice_paid":
        return <DollarSignIcon className="h-4 w-4 text-blue-600" />
      case "job_started":
        return <PlayIcon className="h-4 w-4 text-orange-600" />
      case "aircraft_added":
        return <PlusIcon className="h-4 w-4 text-purple-600" />
      case "customer_added":
        return <UserPlusIcon className="h-4 w-4 text-indigo-600" />
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "job_completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Completed
          </Badge>
        )
      case "invoice_paid":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Payment
          </Badge>
        )
      case "job_started":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Started
          </Badge>
        )
      case "aircraft_added":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            Aircraft
          </Badge>
        )
      case "customer_added":
        return (
          <Badge variant="outline" className="text-indigo-600 border-indigo-600">
            Customer
          </Badge>
        )
      default:
        return <Badge variant="outline">Activity</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and events in your system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityBadge(activity.type)}
                  <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-foreground">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
