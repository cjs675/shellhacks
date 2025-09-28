"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Activity, AlertTriangle } from "lucide-react"

interface Aircraft {
  id: string
  tail_number: string
  icao24_address: string
  aircraft_type: string
  manufacturer: string
  model: string
  year_manufactured: number | null
  owner_name: string | null
  base_location: string | null
  tracking_enabled: boolean
  created_at: string
  updated_at: string
}

interface FleetOverviewProps {
  aircraft: Aircraft[]
}

export function FleetOverview({ aircraft }: FleetOverviewProps) {
  const totalAircraft = aircraft.length
  const trackingEnabled = aircraft.filter((a) => a.tracking_enabled).length
  const lightJets = aircraft.filter((a) => a.aircraft_type === "Light Jet").length
  const mediumJets = aircraft.filter((a) => a.aircraft_type === "Medium Jet").length
  const heavyJets = aircraft.filter((a) => a.aircraft_type === "Heavy Jet").length

  const stats = [
    {
      title: "Total Aircraft",
      value: totalAircraft,
      icon: Plane,
      description: "Aircraft in fleet",
    },
    {
      title: "Tracking Enabled",
      value: trackingEnabled,
      icon: Activity,
      description: `${trackingEnabled}/${totalAircraft} aircraft`,
    },
    {
      title: "Base Locations",
      value: new Set(aircraft.map((a) => a.base_location).filter(Boolean)).size,
      icon: MapPin,
      description: "Unique locations",
    },
    {
      title: "Tracking Disabled",
      value: totalAircraft - trackingEnabled,
      icon: AlertTriangle,
      description: "Requires attention",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}

      {/* Aircraft Type Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Fleet Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Light Jets</Badge>
              <span className="text-sm text-muted-foreground">{lightJets}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Medium Jets</Badge>
              <span className="text-sm text-muted-foreground">{mediumJets}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Heavy Jets</Badge>
              <span className="text-sm text-muted-foreground">{heavyJets}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
