"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plane } from "lucide-react"

interface Aircraft {
  id: string
  tail_number: string
  icao24_address: string
  manufacturer: string
  model: string
}

interface FlightState {
  icao24: string
  callsign: string | null
  longitude: number | null
  latitude: number | null
  baro_altitude: number | null
  on_ground: boolean
  velocity: number | null
}

interface FlightMapProps {
  aircraft: Aircraft[]
  flightStates: Record<string, FlightState | null>
}

export function FlightMap({ aircraft, flightStates }: FlightMapProps) {
  const aircraftWithPositions = aircraft.filter((plane) => {
    const state = flightStates[plane.icao24_address]
    return state && state.latitude && state.longitude
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Flight Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-8 text-center">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
            <p className="text-muted-foreground">
              Real-time aircraft positions will be displayed on an interactive map
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aircraft Position List */}
      <Card>
        <CardHeader>
          <CardTitle>Aircraft Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aircraftWithPositions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No aircraft positions available</p>
            ) : (
              aircraftWithPositions.map((plane) => {
                const state = flightStates[plane.icao24_address]!
                return (
                  <div key={plane.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{plane.tail_number}</span>
                        <Badge variant={state.on_ground ? "secondary" : "default"}>
                          {state.on_ground ? "Ground" : "Airborne"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plane.manufacturer} {plane.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">
                        {state.latitude!.toFixed(4)}, {state.longitude!.toFixed(4)}
                      </p>
                      {state.baro_altitude && (
                        <p className="text-xs text-muted-foreground">
                          {Math.round(state.baro_altitude * 3.28084).toLocaleString()} ft
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
