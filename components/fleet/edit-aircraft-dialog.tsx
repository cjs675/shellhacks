"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

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
}

interface EditAircraftDialogProps {
  aircraft: Aircraft
  open: boolean
  onOpenChange: (open: boolean) => void
  onAircraftUpdated: (aircraft: Aircraft) => void
}

export function EditAircraftDialog({ aircraft, open, onOpenChange, onAircraftUpdated }: EditAircraftDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    tail_number: "",
    icao24_address: "",
    aircraft_type: "",
    manufacturer: "",
    model: "",
    year_manufactured: "",
    owner_name: "",
    base_location: "",
    tracking_enabled: true,
  })

  useEffect(() => {
    if (aircraft) {
      setFormData({
        tail_number: aircraft.tail_number,
        icao24_address: aircraft.icao24_address,
        aircraft_type: aircraft.aircraft_type,
        manufacturer: aircraft.manufacturer,
        model: aircraft.model,
        year_manufactured: aircraft.year_manufactured?.toString() || "",
        owner_name: aircraft.owner_name || "",
        base_location: aircraft.base_location || "",
        tracking_enabled: aircraft.tracking_enabled,
      })
    }
  }, [aircraft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const aircraftData = {
      ...formData,
      year_manufactured: formData.year_manufactured ? Number.parseInt(formData.year_manufactured) : null,
      tail_number: formData.tail_number.toUpperCase(),
      icao24_address: formData.icao24_address.toUpperCase(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("aircraft").update(aircraftData).eq("id", aircraft.id).select().single()

    if (error) {
      console.error("Error updating aircraft:", error)
      setIsLoading(false)
      return
    }

    onAircraftUpdated(data)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Aircraft</DialogTitle>
          <DialogDescription>Update aircraft information and settings.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tail_number">Tail Number *</Label>
                <Input
                  id="tail_number"
                  value={formData.tail_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tail_number: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icao24_address">ICAO24 Address *</Label>
                <Input
                  id="icao24_address"
                  maxLength={6}
                  value={formData.icao24_address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icao24_address: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="aircraft_type">Aircraft Type *</Label>
              <Select
                value={formData.aircraft_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, aircraft_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light Jet">Light Jet</SelectItem>
                  <SelectItem value="Medium Jet">Medium Jet</SelectItem>
                  <SelectItem value="Heavy Jet">Heavy Jet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year_manufactured">Year Manufactured</Label>
                <Input
                  id="year_manufactured"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year_manufactured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, year_manufactured: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="base_location">Base Location</Label>
              <Input
                id="base_location"
                value={formData.base_location}
                onChange={(e) => setFormData((prev) => ({ ...prev, base_location: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tracking_enabled"
                checked={formData.tracking_enabled}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, tracking_enabled: checked }))}
              />
              <Label htmlFor="tracking_enabled">Enable flight tracking</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Aircraft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
