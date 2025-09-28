"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Customer {
  id: string
  company_name: string | null
  contact_name: string
  email: string
}

interface DeleteCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerDeleted: (id: string) => void
}

export function DeleteCustomerDialog({ customer, open, onOpenChange, onCustomerDeleted }: DeleteCustomerDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("customers").delete().eq("id", customer.id)

    if (error) {
      console.error("Error deleting customer:", error)
      setIsLoading(false)
      return
    }

    onCustomerDeleted(customer.id)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Customer</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this customer? This action cannot be undone and will affect all related jobs
            and invoices.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">{customer.company_name || customer.contact_name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
