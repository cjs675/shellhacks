"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plane, Calendar, DollarSign, MoreHorizontal, Edit, Trash2, Search, User } from "lucide-react"
import { EditJobDialog } from "./edit-job-dialog"
import { DeleteJobDialog } from "./delete-job-dialog"

interface Job {
  id: string
  job_number: string
  status: string
  priority: string
  scheduled_start: string | null
  scheduled_end: string | null
  total_estimated_cost: number | null
  total_actual_cost: number | null
  location: string | null
  special_instructions: string | null
  aircraft: {
    tail_number: string
    manufacturer: string
    model: string
    aircraft_type: string
  } | null
  customer: {
    company_name: string | null
    contact_name: string
    email: string
  } | null
  job_services: Array<{
    service: {
      service_name: string
      service_category: string
    } | null
  }>
}

interface JobsListProps {
  jobs: Job[]
}

export function JobsList({ jobs: initialJobs }: JobsListProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.aircraft?.tail_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "in_progress":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "secondary"
      case "normal":
        return "outline"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleEdit = (job: Job) => {
    setSelectedJob(job)
    setShowEditDialog(true)
  }

  const handleDelete = (job: Job) => {
    setSelectedJob(job)
    setShowDeleteDialog(true)
  }

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)))
    setShowEditDialog(false)
    setSelectedJob(null)
  }

  const handleJobDeleted = (deletedId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== deletedId))
    setShowDeleteDialog(false)
    setSelectedJob(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredJobs.length} jobs</Badge>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first detailing job to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{job.job_number}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(job)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(job)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(job.status)}>{job.status.replace("_", " ")}</Badge>
                  <Badge variant={getPriorityColor(job.priority)}>{job.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Aircraft Info */}
                {job.aircraft && (
                  <div className="flex items-center gap-2 text-sm">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.aircraft.tail_number}</span>
                    <span className="text-muted-foreground">
                      {job.aircraft.manufacturer} {job.aircraft.model}
                    </span>
                  </div>
                )}

                {/* Customer Info */}
                {job.customer && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.customer.company_name || job.customer.contact_name}</span>
                  </div>
                )}

                {/* Schedule */}
                {job.scheduled_start && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(job.scheduled_start)}</span>
                  </div>
                )}

                {/* Services */}
                {job.job_services.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.job_services.slice(0, 3).map((js, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {js.service?.service_name}
                        </Badge>
                      ))}
                      {job.job_services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.job_services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Cost */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {job.status === "completed" ? "Total Cost" : "Estimated Cost"}
                    </span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {(job.total_actual_cost || job.total_estimated_cost || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {job.location && <p className="text-xs text-muted-foreground">Location: {job.location}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedJob && (
        <>
          <EditJobDialog
            job={selectedJob}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onJobUpdated={handleJobUpdated}
          />
          <DeleteJobDialog
            job={selectedJob}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onJobDeleted={handleJobDeleted}
          />
        </>
      )}
    </div>
  )
}
