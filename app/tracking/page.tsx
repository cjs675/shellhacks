import { createClient } from "@/lib/supabase/server"
import { FlightTrackingDashboard } from "@/components/tracking/flight-tracking-dashboard"
import { TrackingControls } from "@/components/tracking/tracking-controls"

export default async function TrackingPage() {
  const supabase = await createClient()

  // Fetch aircraft with tracking enabled
  const { data: aircraft, error } = await supabase
    .from("aircraft")
    .select("*")
    .eq("tracking_enabled", true)
    .order("tail_number")

  if (error) {
    console.error("Error fetching aircraft:", error)
  }

  const trackingAircraft = aircraft || []

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flight Tracking</h1>
          <p className="text-muted-foreground">Real-time aircraft location and flight status monitoring</p>
        </div>
        <TrackingControls aircraft={trackingAircraft} />
      </div>

      <FlightTrackingDashboard aircraft={trackingAircraft} />
    </div>
  )
}
