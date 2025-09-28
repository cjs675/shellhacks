import { createClient } from "@/lib/supabase/server"
import { BillingOverview } from "@/components/billing/billing-overview"
import { InvoicesList } from "@/components/billing/invoices-list"
import { CustomersList } from "@/components/billing/customers-list"
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog"
import { CreateCustomerDialog } from "@/components/billing/create-customer-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function BillingPage() {
  const supabase = await createClient()

  // Fetch invoices with related data
  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select(`
      *,
      customer:customer_id (
        company_name,
        contact_name,
        email,
        phone,
        address
      ),
      job:job_id (
        job_number,
        aircraft:aircraft_id (
          tail_number,
          manufacturer,
          model
        )
      )
    `)
    .order("created_at", { ascending: false })

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("*")
    .order("company_name", { ascending: true })

  // Fetch completed jobs for invoice creation
  const { data: completedJobs, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      *,
      aircraft:aircraft_id (
        tail_number,
        manufacturer,
        model
      ),
      customer:customer_id (
        company_name,
        contact_name,
        email
      ),
      job_services (
        *,
        service:service_id (
          service_name,
          service_category
        )
      )
    `)
    .eq("status", "completed")
    .is("invoice_id", null)
    .order("updated_at", { ascending: false })

  if (invoicesError || customersError || jobsError) {
    console.error("Error fetching billing data:", { invoicesError, customersError, jobsError })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage customer billing and generate invoices</p>
        </div>
      </div>

      <BillingOverview invoices={invoices || []} customers={customers || []} />

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Invoices</h2>
            <CreateInvoiceDialog completedJobs={completedJobs || []} customers={customers || []}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CreateInvoiceDialog>
          </div>
          <InvoicesList invoices={invoices || []} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Customers</h2>
            <CreateCustomerDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </CreateCustomerDialog>
          </div>
          <CustomersList customers={customers || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
