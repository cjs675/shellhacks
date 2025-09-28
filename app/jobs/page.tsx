import { createClient } from "@/lib/supabase/server"
import { JobsOverview } from "@/components/jobs/jobs-overview"
import { JobsList } from "@/components/jobs/jobs-list"
import { CreateJobDialog } from "@/components/jobs/create-job-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function JobsPage() {
  const supabase = await createClient()

  // Fetch jobs with related data
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      *,
      aircraft:aircraft_id (
        tail_number,
        manufacturer,
        model,
        aircraft_type
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
    .order("created_at", { ascending: false })

  // Fetch aircraft for job creation
  const { data: aircraft, error: aircraftError } = await supabase.from("aircraft").select("*").order("tail_number")

  // Fetch customers for job creation
  const { data: customers, error: customersError } = await supabase.from("customers").select("*").order("company_name")

  // Fetch service catalog
  const { data: services, error: servicesError } = await supabase
    .from("service_catalog")
    .select("*")
    .eq("active", true)
    .order("service_category", { ascending: true })

  if (jobsError || aircraftError || customersError || servicesError) {
    console.error("Error fetching data:", { jobsError, aircraftError, customersError, servicesError })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">Schedule and track aircraft detailing services</p>
        </div>
        <CreateJobDialog aircraft={aircraft || []} customers={customers || []} services={services || []}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </CreateJobDialog>
      </div>

      <JobsOverview jobs={jobs || []} />
      <JobsList jobs={jobs || []} />
    </div>
  )
}
