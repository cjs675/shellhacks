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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Aircraft {
  id: string
  tail_number: string
  manufacturer: string
  model: string
  aircraft_type: string
}

interface Customer {
  id: string
  company_name: string | null
  contact_name: string
  email: string
}

interface Service {
  id: string
  service_name: string
  service_category: string
  base_price: number
  aircraft_size_multiplier: any
}

interface CreateJobDialogProps {
  children: React.ReactNode
  aircraft: Aircraft[]
  customers: Customer[]
  services: Service[]
}

export function CreateJobDialog({ children, aircraft, customers, services }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    aircraft_id: "",
    customer_id: "",
    priority: "normal",
    scheduled_start: "",
    scheduled_end: "",
    location: "",
    special_instructions: "",
    selected_services: [] as string[],
  })

  const generateJobNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `JOB${year}${month}${day}${random}`
  }

  const calculateTotalCost = () => {
    const selectedAircraft = aircraft.find((a) => a.id === formData.aircraft_id)
    if (!selectedAircraft || formData.selected_services.length === 0) return 0

    const aircraftSizeMultiplier = getAircraftSizeMultiplier(selectedAircraft.aircraft_type)

    return formData.selected_services.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return total

      let multiplier = 1
      if (service.aircraft_size_multiplier) {
        const multipliers = service.aircraft_size_multiplier
        multiplier = multipliers[aircraftSizeMultiplier] || 1
      }

      return total + service.base_price * multiplier
    }, 0)
  }

  const getAircraftSizeMultiplier = (aircraftType: string) => {
    switch (aircraftType) {
      case "Light Jet":
        return "light"
      case "Medium Jet":
        return "medium"
      case "Heavy Jet":
        return "heavy"
      default:
        return "light"
    }
  }

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selected_services: checked
        ? [...prev.selected_services, serviceId]
        : prev.selected_services.filter((id) => id !== serviceId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const jobNumber = generateJobNumber()
    const totalCost = calculateTotalCost()

    try {
      // Create the job
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert([
          {
            job_number: jobNumber,
            aircraft_id: formData.aircraft_id,
            customer_id: formData.customer_id,
            status: "scheduled",
            priority: formData.priority,
            scheduled_start: formData.scheduled_start || null,
            scheduled_end: formData.scheduled_end || null,
            location: formData.location || null,
            special_instructions: formData.special_instructions || null,
            total_estimated_cost: totalCost,
          },
        ])
        .select()
        .single()

      if (jobError) throw jobError

      // Create job services
      const selectedAircraft = aircraft.find((a) => a.id === formData.aircraft_id)!
      const aircraftSizeMultiplier = getAircraftSizeMultiplier(selectedAircraft.aircraft_type)

      const jobServices = formData.selected_services.map((serviceId) => {
        const service = services.find((s) => s.id === serviceId)!
        let multiplier = 1
        if (service.aircraft_size_multiplier) {
          const multipliers = service.aircraft_size_multiplier
          multiplier = multipliers[aircraftSizeMultiplier] || 1
        }
        const unitPrice = service.base_price * multiplier

        return {
          job_id: job.id,
          service_id: serviceId,
          quantity: 1,
          unit_price: unitPrice,
          total_price: unitPrice,
        }
      })

      const { error: servicesError } = await supabase.from("job_services").insert(jobServices)

      if (servicesError) throw servicesError

      // Reset form
      setFormData({
        aircraft_id: "",
        customer_id: "",
        priority: "normal",
        scheduled_start: "",
        scheduled_end: "",
        location: "",
        special_instructions: "",
        selected_services: [],
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating job:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const servicesByCategory = services.reduce(
    (acc, service) => {
      if (!acc[service.service_category]) {
        acc[service.service_category] = []
      }
      acc[service.service_category].push(service)
      return acc
    },
    {} as Record<string, Service[]>,
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>Schedule a new aircraft detailing service.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="aircraft">Aircraft *</Label>
                <Select
                  value={formData.aircraft_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, aircraft_id: value }))}
                  required
                >
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

              <div className="grid gap-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, customer_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name || customer.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Hangar 5, Miami International"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduled_start">Scheduled Start</Label>
                <Input
                  id="scheduled_start"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_start: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scheduled_end">Scheduled End</Label>
                <Input
                  id="scheduled_end"
                  type="datetime-local"
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_end: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Services *</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{category}</h4>
                    <div className="space-y-2">
                      {categoryServices.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.id}
                            checked={formData.selected_services.includes(service.id)}
                            onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                          />
                          <Label htmlFor={service.id} className="text-sm flex-1">
                            {service.service_name} - ${service.base_price}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                placeholder="Any special requirements or notes..."
                value={formData.special_instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, special_instructions: e.target.value }))}
              />
            </div>

            {formData.selected_services.length > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Total:</span>
                  <span className="text-lg font-bold">${calculateTotalCost().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || formData.selected_services.length === 0}>
              {isLoading ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
