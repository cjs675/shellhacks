"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Download,
  Edit,
  Eye,
  Search,
  AlertTriangle,
} from "lucide-react"
import { ViewInvoiceDialog } from "./view-invoice-dialog"
import { EditInvoiceDialog } from "./edit-invoice-dialog"

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_amount: number
  due_date: string | null
  paid_date: string | null
  created_at: string
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

interface InvoicesListProps {
  invoices: Invoice[]
}

export function InvoicesList({ invoices: initialInvoices }: InvoicesListProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.job?.job_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status !== "pending" || !invoice.due_date) return false
    return new Date(invoice.due_date) < new Date()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowViewDialog(true)
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowEditDialog(true)
  }

  const handleInvoiceUpdated = (updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i)))
    setShowEditDialog(false)
    setSelectedInvoice(null)
  }

  const handleDownload = (invoice: Invoice) => {
    // Implement PDF download functionality
    console.log("Download invoice:", invoice.invoice_number)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredInvoices.length} invoices</Badge>
      </div>

      {/* Invoices Grid */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first invoice from completed jobs"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{invoice.invoice_number}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(invoice)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(isOverdue(invoice) ? "overdue" : invoice.status)}>
                    {isOverdue(invoice) ? "Overdue" : invoice.status}
                  </Badge>
                  {isOverdue(invoice) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                {invoice.customer && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {invoice.customer.company_name || invoice.customer.contact_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{invoice.customer.email}</p>
                  </div>
                )}

                {/* Job Info */}
                {invoice.job && (
                  <div className="text-sm">
                    <p className="font-medium">Job: {invoice.job.job_number}</p>
                    {invoice.job.aircraft && (
                      <p className="text-muted-foreground">
                        {invoice.job.aircraft.tail_number} - {invoice.job.aircraft.manufacturer}{" "}
                        {invoice.job.aircraft.model}
                      </p>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Total Amount</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{invoice.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(invoice.created_at)}</span>
                  </div>
                  {invoice.due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {formatDate(invoice.due_date)}</span>
                    </div>
                  )}
                  {invoice.paid_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Paid: {formatDate(invoice.paid_date)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedInvoice && (
        <>
          <ViewInvoiceDialog invoice={selectedInvoice} open={showViewDialog} onOpenChange={setShowViewDialog} />
          <EditInvoiceDialog
            invoice={selectedInvoice}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onInvoiceUpdated={handleInvoiceUpdated}
          />
        </>
      )}
    </div>
  )
}
