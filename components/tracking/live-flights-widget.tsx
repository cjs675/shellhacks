"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plane, MapPin, Activity, Clock, Gauge, Navigation, RefreshCw, TrendingUp } from "lucide-react"
import { flightTrackingCache } from "@/lib/flight-tracking-cache"
import { createBrowserClient } from "@/lib/supabase/client"

interface Aircraft {
  id: string
  tail_number: string
  icao24_address: string
  manufacturer: string
  model: string
  tracking_enabled: boolean
}

interface FlightState {
  icao24: string
  callsign: string | null
  origin_country: string
  time_position: number | null
  last_contact: number
  longitude: number | null
  latitude: number | null
  baro_altitude: number | null
  on_ground: boolean
  velocity: number | null
  true_track: number | null
  vertical_rate: number | null
  geo_altitude: number | null
  squawk: string | null
  spi: boolean
  position_source: number
}

interface LiveFlightData {
  aircraft: Aircraft
  flightState: FlightState
  lastUpdated: Date
}

interface LiveFlightsWidgetProps {
  maxFlights?: number
  refreshInterval?: number
  showHeader?: boolean
  compact?: boolean
}

const OPENSKY_BASE_URL = "https://opensky-network.org/api"

export function LiveFlightsWidget({
  maxFlights = 6,
  refreshInterval = 45000, // 45 seconds
  showHeader = true,
  compact = false
}: LiveFlightsWidgetProps) {
  const [liveFlights, setLiveFlights] = useState<LiveFlightData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [trackedAircraft, setTrackedAircraft] = useState<Aircraft[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    loadTrackedAircraft()
  }, [])

  useEffect(() => {
    if (trackedAircraft.length > 0) {
      updateLiveFlights()

      // Set up auto-refresh
      const interval = setInterval(updateLiveFlights, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [trackedAircraft, refreshInterval])

  const loadTrackedAircraft = async () => {
    try {
      // Get frequently accessed and favorite aircraft from cache
      const suggestions = flightTrackingCache.getQuickAccessSuggestions()
      const favoriteTailNumbers = flightTrackingCache.getFavorites()
      const frequentTailNumbers = flightTrackingCache.getFrequentlyAccessed().map(a => a.tail_number)

      // Combine all tracked tail numbers (favorites + frequent + recent)
      const allTrackedTailNumbers = [
        ...new Set([
          ...favoriteTailNumbers,
          ...frequentTailNumbers,
          ...suggestions.map(s => s.tail_number)
        ])
      ]

      if (allTrackedTailNumbers.length === 0) {
        setIsLoading(false)
        return
      }

      // Fetch aircraft data from database
      const { data: aircraftData, error } = await supabase
        .from('aircraft')
        .select('*')
        .in('tail_number', allTrackedTailNumbers)
        .eq('tracking_enabled', true)

      if (error) throw error

      setTrackedAircraft(aircraftData || [])
    } catch (error) {
      console.error('Error loading tracked aircraft:', error)
      setIsLoading(false)
    }
  }

  const fetchFlightData = async (icao24: string): Promise<FlightState | null> => {
    try {
      const response = await fetch(`${OPENSKY_BASE_URL}/states/all?icao24=${icao24.toLowerCase()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.states || data.states.length === 0) {
        return null
      }

      const state = data.states[0]
      return {
        icao24: state[0],
        callsign: state[1]?.trim() || null,
        origin_country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude: state[5],
        latitude: state[6],
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        true_track: state[10],
        vertical_rate: state[11],
        geo_altitude: state[12],
        squawk: state[13],
        spi: state[14],
        position_source: state[15],
      }
    } catch (error) {
      console.error(`Error fetching flight data for ${icao24}:`, error)
      return null
    }
  }

  const updateLiveFlights = async () => {
    if (trackedAircraft.length === 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const activeFlights: LiveFlightData[] = []

    // Fetch flight data for all tracked aircraft
    for (let i = 0; i < trackedAircraft.length; i++) {
      const aircraft = trackedAircraft[i]
      const flightState = await fetchFlightData(aircraft.icao24_address)

      // Only include aircraft that are airborne (not on ground and have valid data)
      if (flightState && !flightState.on_ground && flightState.latitude && flightState.longitude) {
        activeFlights.push({
          aircraft,
          flightState,
          lastUpdated: new Date()
        })
      }

      // Add small delay between requests to respect rate limits
      if (i < trackedAircraft.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150))
      }
    }

    // Sort by altitude (highest first) and limit to max flights
    activeFlights.sort((a, b) => (b.flightState.baro_altitude || 0) - (a.flightState.baro_altitude || 0))
    setLiveFlights(activeFlights.slice(0, maxFlights))
    setLastUpdate(new Date())
    setIsLoading(false)
  }

  const formatLastContact = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return "24h+ ago"
  }

  const getAltitudeColor = (altitude: number | null) => {
    if (!altitude) return "text-gray-500"
    if (altitude > 35000) return "text-blue-600"
    if (altitude > 20000) return "text-green-600"
    if (altitude > 10000) return "text-yellow-600"
    return "text-orange-600"
  }

  if (isLoading && liveFlights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              Live Flights
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {liveFlights.length} airborne
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={updateLiveFlights}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-4" : "p-6"}>
        {liveFlights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No Aircraft Currently Airborne</p>
            <p className="text-sm">
              {trackedAircraft.length === 0
                ? "Add aircraft to tracking to see live flights"
                : "All tracked aircraft are currently on the ground"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {liveFlights.map((flight, index) => (
              <div
                key={flight.aircraft.id}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                  compact ? 'text-sm' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-600">
                      {flight.aircraft.tail_number}
                    </span>
                    {flight.flightState.callsign && (
                      <Badge variant="outline" className="text-xs">
                        {flight.flightState.callsign}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      Airborne
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {flight.aircraft.manufacturer} {flight.aircraft.model}
                  </div>

                  {!compact && (
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {flight.flightState.latitude && flight.flightState.longitude && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {flight.flightState.latitude.toFixed(2)}, {flight.flightState.longitude.toFixed(2)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastContact(flight.flightState.last_contact)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  {flight.flightState.baro_altitude && (
                    <div className={`font-semibold ${getAltitudeColor(flight.flightState.baro_altitude)}`}>
                      {Math.round(flight.flightState.baro_altitude * 3.28084).toLocaleString()} ft
                    </div>
                  )}

                  {flight.flightState.velocity && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Gauge className="h-3 w-3" />
                      {Math.round(flight.flightState.velocity * 1.94384)} kts
                    </div>
                  )}

                  {flight.flightState.true_track !== null && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Navigation className="h-3 w-3" />
                      {Math.round(flight.flightState.true_track)}°
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {lastUpdate && (
          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
            {trackedAircraft.length > 0 && (
              <span className="ml-2">• Tracking {trackedAircraft.length} aircraft</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}