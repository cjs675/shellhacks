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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CompletedJob {
  id: string
  job_number: string
  total_actual_cost: number | null
  total_estimated_cost: number | null
  aircraft: {
    tail_number: string
    manufacturer: string
    model: string
  } | null
  customer: {
    company_name: string | null
    contact_name: string
    email: string
  } | null
  job_services: Array<{
    service: {
      service_name: string
      service_category: string
    } | null
  }>
}

interface Customer {
  id: string
  company_name: string | null
  contact_name: string
  email: string
}

interface CreateInvoiceDialogProps {
  children: React.ReactNode
  completedJobs: CompletedJob[]
  customers: Customer[]
}

export function CreateInvoiceDialog({ children, completedJobs, customers }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    job_id: "",
    customer_id: "",
    due_date: "",
    notes: "",
    payment_terms: "Net 30",
  })

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `INV${year}${month}${day}${random}`
  }

  const selectedJob = completedJobs.find((job) => job.id === formData.job_id)
  const totalAmount = selectedJob ? selectedJob.total_actual_cost || selectedJob.total_estimated_cost || 0 : 0

  const handleJobChange = (jobId: string) => {
    const job = completedJobs.find((j) => j.id === jobId)
    setFormData((prev) => ({
      ...prev,
      job_id: jobId,
      customer_id: job?.customer?.email ? customers.find((c) => c.email === job.customer!.email)?.id || "" : "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const invoiceNumber = generateInvoiceNumber()

    try {
      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            invoice_number: invoiceNumber,
            job_id: formData.job_id,
            customer_id: formData.customer_id,
            status: "pending",
            total_amount: totalAmount,
            due_date: formData.due_date || null,
            notes: formData.notes || null,
            payment_terms: formData.payment_terms,
          },
        ])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Update the job to link it to the invoice
      const { error: jobUpdateError } = await supabase
        .from("jobs")
        .update({ invoice_id: invoice.id })
        .eq("id", formData.job_id)

      if (jobUpdateError) throw jobUpdateError

      // Reset form
      setFormData({
        job_id: "",
        customer_id: "",
        due_date: "",
        notes: "",
        payment_terms: "Net 30",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Generate an invoice from a completed job.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="job">Completed Job *</Label>
              <Select value={formData.job_id} onValueChange={handleJobChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select completed job" />
                </SelectTrigger>
                <SelectContent>
                  {completedJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.job_number} - {job.aircraft?.tail_number} - $
                      {(job.total_actual_cost || job.total_estimated_cost || 0).toLocaleString()}
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
                      {customer.company_name || customer.contact_name} - {customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or payment instructions..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {selectedJob && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Invoice Preview</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Job:</strong> {selectedJob.job_number}
                  </p>
                  <p>
                    <strong>Aircraft:</strong> {selectedJob.aircraft?.tail_number} -{" "}
                    {selectedJob.aircraft?.manufacturer} {selectedJob.aircraft?.model}
                  </p>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {selectedJob.customer?.company_name || selectedJob.customer?.contact_name}
                  </p>
                  <p>
                    <strong>Services:</strong>{" "}
                    {selectedJob.job_services.map((js) => js.service?.service_name).join(", ")}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.job_id || !formData.customer_id}>
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
