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

interface Job {
  id: string
  job_number: string
  status: string
}

interface DeleteJobDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobDeleted: (id: string) => void
}

export function DeleteJobDialog({ job, open, onOpenChange, onJobDeleted }: DeleteJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.from("jobs").delete().eq("id", job.id)

    if (error) {
      console.error("Error deleting job:", error)
      setIsLoading(false)
      return
    }

    onJobDeleted(job.id)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Job</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this job? This action cannot be undone and will also delete all associated
            services and billing records.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">{job.job_number}</p>
            <p className="text-sm text-muted-foreground">Status: {job.status.replace("_", " ")}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
