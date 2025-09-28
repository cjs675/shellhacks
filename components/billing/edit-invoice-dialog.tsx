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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_amount: number
  due_date: string | null
  paid_date: string | null
  notes: string | null
  payment_terms: string | null
}

interface EditInvoiceDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvoiceUpdated: (invoice: Invoice) => void
}

export function EditInvoiceDialog({ invoice, open, onOpenChange, onInvoiceUpdated }: EditInvoiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: "",
    total_amount: "",
    due_date: "",
    paid_date: "",
    notes: "",
    payment_terms: "",
  })

  useEffect(() => {
    if (invoice) {
      setFormData({
        status: invoice.status,
        total_amount: invoice.total_amount.toString(),
        due_date: invoice.due_date ? invoice.due_date.split("T")[0] : "",
        paid_date: invoice.paid_date ? invoice.paid_date.split("T")[0] : "",
        notes: invoice.notes || "",
        payment_terms: invoice.payment_terms || "Net 30",
      })
    }
  }, [invoice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const updateData = {
      status: formData.status,
      total_amount: Number.parseFloat(formData.total_amount),
      due_date: formData.due_date || null,
      paid_date: formData.paid_date || null,
      notes: formData.notes || null,
      payment_terms: formData.payment_terms,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("invoices").update(updateData).eq("id", invoice.id).select().single()

    if (error) {
      console.error("Error updating invoice:", error)
      setIsLoading(false)
      return
    }

    onInvoiceUpdated(data)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>Update invoice details and status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, total_amount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paid_date">Paid Date</Label>
                <Input
                  id="paid_date"
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paid_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select
                value={formData.payment_terms}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_terms: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
