"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plane, MapPin, Calendar, MoreHorizontal, Edit, Trash2, Activity, Search, History } from "lucide-react"
import { EditAircraftDialog } from "./edit-aircraft-dialog"
import { DeleteAircraftDialog } from "./delete-aircraft-dialog"
import { AircraftServiceHistory } from "./aircraft-service-history"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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

interface AircraftListProps {
  aircraft: Aircraft[]
}

export function AircraftList({ aircraft: initialAircraft }: AircraftListProps) {
  const [aircraft, setAircraft] = useState(initialAircraft)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showServiceHistory, setShowServiceHistory] = useState(false)
  const router = useRouter()

  const filteredAircraft = aircraft.filter(
    (a) =>
      a.tail_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.owner_name && a.owner_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleTrackingToggle = async (aircraftId: string, enabled: boolean) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("aircraft")
      .update({ tracking_enabled: enabled, updated_at: new Date().toISOString() })
      .eq("id", aircraftId)

    if (error) {
      console.error("Error updating tracking status:", error)
      return
    }

    setAircraft((prev) => prev.map((a) => (a.id === aircraftId ? { ...a, tracking_enabled: enabled } : a)))
  }

  const handleEdit = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft)
    setShowEditDialog(true)
  }

  const handleDelete = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft)
    setShowDeleteDialog(true)
  }

  const handleViewServiceHistory = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft)
    setShowServiceHistory(true)
  }

  const handleAircraftUpdated = (updatedAircraft: Aircraft) => {
    setAircraft((prev) => prev.map((a) => (a.id === updatedAircraft.id ? updatedAircraft : a)))
    setShowEditDialog(false)
    setSelectedAircraft(null)
  }

  const handleAircraftDeleted = (deletedId: string) => {
    setAircraft((prev) => prev.filter((a) => a.id !== deletedId))
    setShowDeleteDialog(false)
    setSelectedAircraft(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search aircraft..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredAircraft.length} aircraft</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAircraft.map((aircraft) => (
          <Card key={aircraft.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{aircraft.tail_number}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewServiceHistory(aircraft)}>
                      <History className="h-4 w-4 mr-2" />
                      Service History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(aircraft)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(aircraft)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    aircraft.aircraft_type === "Light Jet"
                      ? "default"
                      : aircraft.aircraft_type === "Medium Jet"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {aircraft.aircraft_type}
                </Badge>
                <Badge variant={aircraft.tracking_enabled ? "default" : "destructive"}>
                  <Activity className="h-3 w-3 mr-1" />
                  {aircraft.tracking_enabled ? "Tracking" : "Disabled"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {aircraft.manufacturer} {aircraft.model}
                  </span>
                </div>
                {aircraft.year_manufactured && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{aircraft.year_manufactured}</span>
                  </div>
                )}
                {aircraft.base_location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{aircraft.base_location}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Flight Tracking</span>
                  <Switch
                    checked={aircraft.tracking_enabled}
                    onCheckedChange={(checked) => handleTrackingToggle(aircraft.id, checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">ICAO24: {aircraft.icao24_address}</p>
              </div>

              {aircraft.owner_name && (
                <div className="text-sm">
                  <span className="font-medium">Owner: </span>
                  <span className="text-muted-foreground">{aircraft.owner_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAircraft.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No aircraft found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search terms" : "Add your first aircraft to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {selectedAircraft && (
        <>
          <EditAircraftDialog
            aircraft={selectedAircraft}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onAircraftUpdated={handleAircraftUpdated}
          />
          <DeleteAircraftDialog
            aircraft={selectedAircraft}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onAircraftDeleted={handleAircraftDeleted}
          />
          <Dialog open={showServiceHistory} onOpenChange={setShowServiceHistory}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Service History - {selectedAircraft.tail_number}</DialogTitle>
              </DialogHeader>
              <AircraftServiceHistory aircraft={selectedAircraft} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
