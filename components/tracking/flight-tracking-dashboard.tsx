"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plane, MapPin, Activity, Clock, Gauge, Navigation, RefreshCw, AlertTriangle, CheckCircle, Search, Filter } from "lucide-react"
import { FlightMap } from "./flight-map"
import { FlightHistory } from "./flight-history"
import { QuickAccessAircraft } from "./quick-access-aircraft"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { flightTrackingCache } from "@/lib/flight-tracking-cache"

interface Aircraft {
  id: string
  tail_number: string
  icao24_address: string
  aircraft_type: string
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

interface FlightTrackingDashboardProps {
  aircraft: Aircraft[]
}

const OPENSKY_BASE_URL = "https://opensky-network.org/api"

export function FlightTrackingDashboard({ aircraft }: FlightTrackingDashboardProps) {
  const [flightStates, setFlightStates] = useState<Record<string, FlightState | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft[]>(aircraft)

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

  const updateAllFlightData = async () => {
    if (selectedAircraft.length === 0) return

    setIsLoading(true)
    const newStates: Record<string, FlightState | null> = {}

    // Fetch data for all selected aircraft with small delays to respect rate limits
    for (let i = 0; i < selectedAircraft.length; i++) {
      const plane = selectedAircraft[i]
      const state = await fetchFlightData(plane.icao24_address)
      newStates[plane.icao24_address] = state

      // Add small delay between requests to respect rate limits (10 req/sec max)
      if (i < selectedAircraft.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
    }

    setFlightStates(newStates)
    setLastUpdate(new Date())
    setIsLoading(false)
  }

  // Initial load
  useEffect(() => {
    updateAllFlightData()
  }, [selectedAircraft])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      updateAllFlightData()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, selectedAircraft])

  // Filter aircraft based on search and status
  const filteredAircraft = selectedAircraft.filter(plane => {
    const matchesSearch = plane.tail_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plane.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plane.model.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === "all") return true

    const state = flightStates[plane.icao24_address]
    if (statusFilter === "active") return !!state
    if (statusFilter === "airborne") return state && !state.on_ground
    if (statusFilter === "ground") return state && state.on_ground
    if (statusFilter === "offline") return !state

    return true
  })

  // Handle aircraft selection from quick access
  const handleAircraftSelect = (newAircraft: Aircraft) => {
    if (!selectedAircraft.find(a => a.id === newAircraft.id)) {
      setSelectedAircraft(prev => [...prev, newAircraft])
      // Track access in cache
      flightTrackingCache.trackAircraftAccess(newAircraft.tail_number, newAircraft.icao24_address)
    }
  }

  // Remove aircraft from tracking
  const handleRemoveAircraft = (aircraftToRemove: Aircraft) => {
    setSelectedAircraft(prev => prev.filter(a => a.id !== aircraftToRemove.id))
  }

  const getStatusColor = (state: FlightState | null) => {
    if (!state) return "destructive"
    if (state.on_ground) return "secondary"
    return "default"
  }

  const getStatusText = (state: FlightState | null) => {
    if (!state) return "Offline"
    if (state.on_ground) return "On Ground"
    return "Airborne"
  }

  const formatLastContact = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const activeAircraft = selectedAircraft.filter((a) => flightStates[a.icao24_address])
  const offlineAircraft = selectedAircraft.filter((a) => !flightStates[a.icao24_address])

  return (
    <div className="space-y-6">
      {/* Quick Access */}
      <QuickAccessAircraft
        onAircraftSelect={handleAircraftSelect}
        selectedAircraft={selectedAircraft}
      />

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tracking aircraft..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aircraft</SelectItem>
                <SelectItem value="active">Active (Has Data)</SelectItem>
                <SelectItem value="airborne">Airborne</SelectItem>
                <SelectItem value="ground">On Ground</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {filteredAircraft.length} of {selectedAircraft.length} shown
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aircraft</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAircraft.length}</div>
            <p className="text-xs text-muted-foreground">Being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAircraft.length}</div>
            <p className="text-xs text-muted-foreground">Receiving data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineAircraft.length}</div>
            <p className="text-xs text-muted-foreground">No data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--"}</div>
            <div className="flex items-center gap-2 mt-1">
              <Button variant="ghost" size="sm" onClick={updateAllFlightData} disabled={isLoading} className="h-6 px-2">
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Badge variant={autoRefresh ? "default" : "secondary"} className="text-xs">
                {autoRefresh ? "Auto" : "Manual"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Tracking</TabsTrigger>
          <TabsTrigger value="map">Flight Map</TabsTrigger>
          <TabsTrigger value="history">Flight History</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {selectedAircraft.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Aircraft Selected</h3>
                <p className="text-muted-foreground text-center">
                  Add aircraft using Quick Access above to start live tracking
                </p>
              </CardContent>
            </Card>
          ) : filteredAircraft.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matching Aircraft</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAircraft.map((plane) => {
                const state = flightStates[plane.icao24_address]
                return (
                  <Card key={plane.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{plane.tail_number}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(state)}>
                            <Activity className="h-3 w-3 mr-1" />
                            {getStatusText(state)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAircraft(plane)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plane.manufacturer} {plane.model}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {state ? (
                        <>
                          {state.callsign && (
                            <div className="flex items-center gap-2 text-sm">
                              <Navigation className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Callsign: {state.callsign}</span>
                            </div>
                          )}

                          {state.latitude && state.longitude && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {state.latitude.toFixed(4)}, {state.longitude.toFixed(4)}
                              </span>
                            </div>
                          )}

                          {state.baro_altitude && (
                            <div className="flex items-center gap-2 text-sm">
                              <Gauge className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.round(state.baro_altitude * 3.28084).toLocaleString()} ft</span>
                            </div>
                          )}

                          {state.velocity && (
                            <div className="flex items-center gap-2 text-sm">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.round(state.velocity * 1.94384)} knots</span>
                            </div>
                          )}

                          <div className="pt-2 border-t text-xs text-muted-foreground">
                            Last contact: {formatLastContact(state.last_contact)}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No flight data available</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Aircraft may be powered down or out of range
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <FlightMap aircraft={filteredAircraft} flightStates={flightStates} />
        </TabsContent>

        <TabsContent value="history">
          <FlightHistory aircraft={filteredAircraft} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
