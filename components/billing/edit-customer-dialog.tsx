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
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface Customer {
  id: string
  company_name: string | null
  contact_name: string
  email: string
  phone: string | null
  address: string | null
}

interface EditCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerUpdated: (customer: Customer) => void
}

export function EditCustomerDialog({ customer, open, onOpenChange, onCustomerUpdated }: EditCustomerDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || "",
        contact_name: customer.contact_name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
      })
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const updateData = {
      company_name: formData.company_name || null,
      contact_name: formData.contact_name,
      email: formData.email,
      phone: formData.phone || null,
      address: formData.address || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("customers").update(updateData).eq("id", customer.id).select().single()

    if (error) {
      console.error("Error updating customer:", error)
      setIsLoading(false)
      return
    }

    onCustomerUpdated(data)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>Update customer information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_name">Contact Name *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
