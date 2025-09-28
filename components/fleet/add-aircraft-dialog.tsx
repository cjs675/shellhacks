"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddAircraftDialogProps {
  children: React.ReactNode
}

export function AddAircraftDialog({ children }: AddAircraftDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const aircraftData = {
      ...formData,
      year_manufactured: formData.year_manufactured ? Number.parseInt(formData.year_manufactured) : null,
      tail_number: formData.tail_number.toUpperCase(),
      icao24_address: formData.icao24_address.toUpperCase(),
    }

    const { error } = await supabase.from("aircraft").insert([aircraftData])

    if (error) {
      console.error("Error adding aircraft:", error)
      setIsLoading(false)
      return
    }

    // Reset form
    setFormData({
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

    setOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Aircraft</DialogTitle>
          <DialogDescription>Add a new aircraft to your fleet management system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tail_number">Tail Number *</Label>
                <Input
                  id="tail_number"
                  placeholder="N123AB"
                  value={formData.tail_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tail_number: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icao24_address">ICAO24 Address *</Label>
                <Input
                  id="icao24_address"
                  placeholder="A12345"
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
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft type" />
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
                  placeholder="Cessna"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="Citation CJ3+"
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
                  placeholder="2020"
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
                  placeholder="Executive Aviation LLC"
                  value={formData.owner_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="base_location">Base Location</Label>
              <Input
                id="base_location"
                placeholder="Miami International Airport"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Aircraft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
