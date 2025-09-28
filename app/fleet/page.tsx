import { createClient } from "@/lib/supabase/server"
import { FleetOverview } from "@/components/fleet/fleet-overview"
import { AircraftList } from "@/components/fleet/aircraft-list"
import { AddAircraftDialog } from "@/components/fleet/add-aircraft-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function FleetPage() {
  const supabase = await createClient()

  // Fetch aircraft data
  const { data: aircraft, error } = await supabase
    .from("aircraft")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching aircraft:", error)
  }

  const aircraftData = aircraft || []

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your aircraft fleet and tracking settings</p>
        </div>
        <AddAircraftDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Aircraft
          </Button>
        </AddAircraftDialog>
      </div>

      <FleetOverview aircraft={aircraftData} />
      <AircraftList aircraft={aircraftData} />
    </div>
  )
}
