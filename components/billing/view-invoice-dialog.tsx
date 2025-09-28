"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_amount: number
  due_date: string | null
  paid_date: string | null
  created_at: string
  notes: string | null
  payment_terms: string | null
  customer: {
    company_name: string | null
    contact_name: string
    email: string
    phone: string | null
    address: string | null
  } | null
  job: {
    job_number: string
    aircraft: {
      tail_number: string
      manufacturer: string
      model: string
    } | null
  } | null
}

interface ViewInvoiceDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log("Download invoice:", invoice.invoice_number)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{invoice.invoice_number}</DialogTitle>
              <DialogDescription>Invoice details and summary</DialogDescription>
            </div>
            <Badge variant={getStatusColor(invoice.status)} className="text-sm">
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="bg-muted p-6 rounded-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                {invoice.customer && (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{invoice.customer.company_name || invoice.customer.contact_name}</p>
                    {invoice.customer.company_name && <p>{invoice.customer.contact_name}</p>}
                    <p>{invoice.customer.email}</p>
                    {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
                    {invoice.customer.address && <p className="text-muted-foreground">{invoice.customer.address}</p>}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Invoice Date: </span>
                    <span>{formatDate(invoice.created_at)}</span>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <span className="text-muted-foreground">Due Date: </span>
                      <span>{formatDate(invoice.due_date)}</span>
                    </div>
                  )}
                  {invoice.paid_date && (
                    <div>
                      <span className="text-muted-foreground">Paid Date: </span>
                      <span>{formatDate(invoice.paid_date)}</span>
                    </div>
                  )}
                  {invoice.payment_terms && (
                    <div>
                      <span className="text-muted-foreground">Terms: </span>
                      <span>{invoice.payment_terms}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          {invoice.job && (
            <div>
              <h3 className="font-semibold mb-3">Service Details</h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Job: {invoice.job.job_number}</span>
                </div>
                {invoice.job.aircraft && (
                  <p className="text-sm text-muted-foreground">
                    Aircraft: {invoice.job.aircraft.tail_number} - {invoice.job.aircraft.manufacturer}{" "}
                    {invoice.job.aircraft.model}
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold">${invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{invoice.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
