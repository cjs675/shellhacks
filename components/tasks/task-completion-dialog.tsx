"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface TaskCompletionDialogProps {
  task: {
    id: string
    title: string
    description: string
    status: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: () => void
}

export function TaskCompletionDialog({ task, open, onOpenChange, onTaskUpdated }: TaskCompletionDialogProps) {
  const { profile } = useAuth()
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const supabase = createBrowserClient()

  const handleStartTask = async () => {
    if (!profile) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("task_items")
        .update({
          status: "in_progress",
          completed_by: profile.id,
        })
        .eq("id", task.id)

      if (error) throw error

      // Log the activity
      await supabase.rpc("log_activity", {
        p_action: "task_started",
        p_resource_type: "task_item",
        p_resource_id: task.id,
        p_new_values: { status: "in_progress", completed_by: profile.id },
      })

      onTaskUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error starting task:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!profile) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("task_items")
        .update({
          status: "completed_pending_review",
          completed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", task.id)

      if (error) throw error

      // Log the activity
      await supabase.rpc("log_activity", {
        p_action: "task_completed",
        p_resource_type: "task_item",
        p_resource_id: task.id,
        p_new_values: {
          status: "completed_pending_review",
          completed_at: new Date().toISOString(),
          notes: notes || null,
        },
      })

      onTaskUpdated()
      onOpenChange(false)
      setNotes("")
    } catch (error) {
      console.error("Error completing task:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const isStarting = task.status === "pending"
  const isCompleting = task.status === "in_progress"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isStarting ? (
              <>
                <Clock className="h-5 w-5 text-blue-600" />
                Start Task
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Complete Task
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isStarting
              ? "Mark this task as in progress and begin working on it."
              : "Mark this task as completed and submit for review."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          {isCompleting && (
            <div>
              <Label htmlFor="completion-notes" className="text-sm font-medium">
                Completion Notes (Optional)
              </Label>
              <Textarea
                id="completion-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the work performed, issues encountered, or special observations..."
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                These notes will be visible to supervisors during the review process.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          {isStarting ? (
            <Button onClick={handleStartTask} disabled={submitting}>
              {submitting ? "Starting..." : "Start Task"}
            </Button>
          ) : (
            <Button onClick={handleCompleteTask} disabled={submitting}>
              {submitting ? "Submitting..." : "Mark Complete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
