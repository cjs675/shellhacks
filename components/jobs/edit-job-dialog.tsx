"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Job {
  id: string
  job_number: string
  status: string
  priority: string
  scheduled_start: string | null
  scheduled_end: string | null
  location: string | null
  special_instructions: string | null
  total_estimated_cost: number | null
  total_actual_cost: number | null
}

interface EditJobDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdated: (job: Job) => void
}

export function EditJobDialog({ job, open, onOpenChange, onJobUpdated }: EditJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: "",
    priority: "",
    scheduled_start: "",
    scheduled_end: "",
    location: "",
    special_instructions: "",
    total_actual_cost: "",
  })

  useEffect(() => {
    if (job) {
      setFormData({
        status: job.status,
        priority: job.priority,
        scheduled_start: job.scheduled_start ? job.scheduled_start.slice(0, 16) : "",
        scheduled_end: job.scheduled_end ? job.scheduled_end.slice(0, 16) : "",
        location: job.location || "",
        special_instructions: job.special_instructions || "",
        total_actual_cost: job.total_actual_cost?.toString() || "",
      })
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const updateData = {
      status: formData.status,
      priority: formData.priority,
      scheduled_start: formData.scheduled_start || null,
      scheduled_end: formData.scheduled_end || null,
      location: formData.location || null,
      special_instructions: formData.special_instructions || null,
      total_actual_cost: formData.total_actual_cost ? Number.parseFloat(formData.total_actual_cost) : null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("jobs").update(updateData).eq("id", job.id).select().single()

    if (error) {
      console.error("Error updating job:", error)
      setIsLoading(false)
      return
    }

    onJobUpdated(data)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>Update job details and status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduled_start">Scheduled Start</Label>
                <Input
                  id="scheduled_start"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_start: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scheduled_end">Scheduled End</Label>
                <Input
                  id="scheduled_end"
                  type="datetime-local"
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_end: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="total_actual_cost">Actual Cost</Label>
              <Input
                id="total_actual_cost"
                type="number"
                step="0.01"
                placeholder="Enter actual cost if different from estimate"
                value={formData.total_actual_cost}
                onChange={(e) => setFormData((prev) => ({ ...prev, total_actual_cost: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, special_instructions: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
