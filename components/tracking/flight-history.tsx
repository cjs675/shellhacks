"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Download } from "lucide-react"

interface Aircraft {
  id: string
  tail_number: string
  icao24_address: string
  manufacturer: string
  model: string
}

interface FlightHistoryProps {
  aircraft: Aircraft[]
}

export function FlightHistory({ aircraft }: FlightHistoryProps) {
  const [selectedAircraft, setSelectedAircraft] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!selectedAircraft || !startDate || !endDate) return

    setIsLoading(true)

    const plane = aircraft.find((a) => a.id === selectedAircraft)
    if (!plane) return

    try {
      const begin = Math.floor(new Date(startDate).getTime() / 1000)
      const end = Math.floor(new Date(endDate).getTime() / 1000)

      const response = await fetch(
        `https://opensky-network.org/api/flights/aircraft?icao24=${plane.icao24_address.toLowerCase()}&begin=${begin}&end=${end}`,
      )

      if (response.ok) {
        const flights = await response.json()
        console.log("Flight history:", flights)
        // Handle flight history data here
      }
    } catch (error) {
      console.error("Error fetching flight history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Flight History Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="aircraft-select">Aircraft</Label>
              <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.map((plane) => (
                    <SelectItem key={plane.id} value={plane.id}>
                      {plane.tail_number} - {plane.manufacturer} {plane.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isLoading || !selectedAircraft || !startDate || !endDate}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Search Flights"}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flight Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>Select an aircraft and date range to view flight history</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
