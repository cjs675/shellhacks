"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Search } from "lucide-react"
import { EditCustomerDialog } from "./edit-customer-dialog"
import { DeleteCustomerDialog } from "./delete-customer-dialog"

interface Customer {
  id: string
  company_name: string | null
  contact_name: string
  email: string
  phone: string | null
  address: string | null
  created_at: string
}

interface CustomersListProps {
  customers: Customer[]
}

export function CustomersList({ customers: initialCustomers }: CustomersListProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowEditDialog(true)
  }

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteDialog(true)
  }

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
    setShowEditDialog(false)
    setSelectedCustomer(null)
  }

  const handleCustomerDeleted = (deletedId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== deletedId))
    setShowDeleteDialog(false)
    setSelectedCustomer(null)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredCustomers.length} customers</Badge>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search" : "Add your first customer to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {customer.company_name || customer.contact_name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(customer)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(customer)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {customer.company_name && (
                  <p className="text-sm text-muted-foreground">Contact: {customer.contact_name}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>

                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{customer.address}</span>
                  </div>
                )}

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Added: {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedCustomer && (
        <>
          <EditCustomerDialog
            customer={selectedCustomer}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onCustomerUpdated={handleCustomerUpdated}
          />
          <DeleteCustomerDialog
            customer={selectedCustomer}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onCustomerDeleted={handleCustomerDeleted}
          />
        </>
      )}
    </div>
  )
}
