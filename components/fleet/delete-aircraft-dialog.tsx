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

interface Aircraft {
  id: string
  tail_number: string
  manufacturer: string
  model: string
}

interface DeleteAircraftDialogProps {
  aircraft: Aircraft
  open: boolean
  onOpenChange: (open: boolean) => void
  onAircraftDeleted: (id: string) => void
}

export function DeleteAircraftDialog({ aircraft, open, onOpenChange, onAircraftDeleted }: DeleteAircraftDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("aircraft").delete().eq("id", aircraft.id)

    if (error) {
      console.error("Error deleting aircraft:", error)
      setIsLoading(false)
      return
    }

    onAircraftDeleted(aircraft.id)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Aircraft</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this aircraft? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">{aircraft.tail_number}</p>
            <p className="text-sm text-muted-foreground">
              {aircraft.manufacturer} {aircraft.model}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Aircraft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
