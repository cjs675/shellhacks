"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, Clock, TrendingUp, Search, Plus, X, Plane } from "lucide-react"
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

interface QuickAccessAircraftProps {
  onAircraftSelect: (aircraft: Aircraft) => void
  selectedAircraft?: Aircraft[]
}

export function QuickAccessAircraft({ onAircraftSelect, selectedAircraft = [] }: QuickAccessAircraftProps) {
  const [suggestions, setSuggestions] = useState<Array<{ tail_number: string; type: 'favorite' | 'frequent' | 'recent' }>>([])
  const [allAircraft, setAllAircraft] = useState<Aircraft[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [stats, setStats] = useState({ frequently_accessed_count: 0, recent_searches_count: 0, favorites_count: 0, total_access_count: 0 })
  const supabase = createBrowserClient()

  useEffect(() => {
    loadSuggestions()
    loadAllAircraft()
    loadStats()
  }, [])

  const loadSuggestions = () => {
    setSuggestions(flightTrackingCache.getQuickAccessSuggestions())
  }

  const loadStats = () => {
    setStats(flightTrackingCache.getCacheStats())
  }

  const loadAllAircraft = async () => {
    try {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .order('tail_number')

      if (error) throw error
      setAllAircraft(data || [])
    } catch (error) {
      console.error('Error loading aircraft:', error)
    }
  }

  const handleAddAircraft = async (tail_number: string) => {
    // Find aircraft by tail number
    const aircraft = allAircraft.find(a => a.tail_number.toLowerCase() === tail_number.toLowerCase())

    if (!aircraft) {
      alert('Aircraft not found in fleet. Please add it to the fleet first.')
      return
    }

    if (!aircraft.tracking_enabled) {
      alert('Tracking is not enabled for this aircraft. Please enable tracking in Fleet Management.')
      return
    }

    // Track access and add to tracking
    flightTrackingCache.trackAircraftAccess(aircraft.tail_number, aircraft.icao24_address)
    onAircraftSelect(aircraft)

    // Refresh suggestions
    loadSuggestions()
    loadStats()
    setShowAddDialog(false)
    setSearchTerm("")
  }

  const handleSuggestionClick = (tail_number: string) => {
    const aircraft = allAircraft.find(a => a.tail_number === tail_number)
    if (aircraft && aircraft.tracking_enabled) {
      flightTrackingCache.trackAircraftAccess(aircraft.tail_number, aircraft.icao24_address)
      onAircraftSelect(aircraft)
      loadSuggestions()
      loadStats()
    }
  }

  const toggleFavorite = (tail_number: string, event: React.MouseEvent) => {
    event.stopPropagation()
    flightTrackingCache.toggleFavorite(tail_number)
    loadSuggestions()
    loadStats()
  }

  const getTypeIcon = (type: 'favorite' | 'frequent' | 'recent') => {
    switch (type) {
      case 'favorite':
        return <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      case 'frequent':
        return <TrendingUp className="h-3 w-3 text-blue-500" />
      case 'recent':
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const getTypeColor = (type: 'favorite' | 'frequent' | 'recent') => {
    switch (type) {
      case 'favorite':
        return 'bg-yellow-100 text-yellow-800'
      case 'frequent':
        return 'bg-blue-100 text-blue-800'
      case 'recent':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAircraft = allAircraft.filter(aircraft =>
    aircraft.tail_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
    aircraft.tracking_enabled &&
    !selectedAircraft.some(selected => selected.id === aircraft.id)
  )

  return (
    <div className="space-y-4">
      {/* Quick Access Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quick Access</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Aircraft
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Aircraft to Tracking</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Search aircraft by tail number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-4"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredAircraft.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {searchTerm ? 'No matching aircraft found' : 'No available aircraft for tracking'}
                      </p>
                    ) : (
                      filteredAircraft.map(aircraft => (
                        <div
                          key={aircraft.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddAircraft(aircraft.tail_number)}
                        >
                          <div>
                            <div className="font-medium">{aircraft.tail_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {aircraft.manufacturer} {aircraft.model}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => toggleFavorite(aircraft.tail_number, e)}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  flightTrackingCache.isFavorite(aircraft.tail_number)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                              />
                            </Button>
                            <Button size="sm">Add</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No quick access suggestions yet</p>
              <p className="text-sm">Start tracking aircraft to see favorites and frequently accessed planes</p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((suggestion, index) => {
                const aircraft = allAircraft.find(a => a.tail_number === suggestion.tail_number)
                const isSelected = selectedAircraft.some(selected => selected.tail_number === suggestion.tail_number)

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                    onClick={() => !isSelected && handleSuggestionClick(suggestion.tail_number)}
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suggestion.type)}
                      <div>
                        <div className="font-medium">{suggestion.tail_number}</div>
                        {aircraft && (
                          <div className="text-xs text-muted-foreground">
                            {aircraft.manufacturer} {aircraft.model}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={`text-xs ${getTypeColor(suggestion.type)}`}>
                        {suggestion.type}
                      </Badge>
                      {suggestion.type !== 'favorite' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => toggleFavorite(suggestion.tail_number, e)}
                        >
                          <Star
                            className={`h-3 w-3 ${
                              flightTrackingCache.isFavorite(suggestion.tail_number)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-400'
                            }`}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Cache Statistics */}
          {stats.total_access_count > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tracking History</span>
                <div className="flex gap-4">
                  <span>{stats.favorites_count} favorites</span>
                  <span>{stats.frequently_accessed_count} frequent</span>
                  <span>{stats.total_access_count} total accesses</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}