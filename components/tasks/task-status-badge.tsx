import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Wrench, XCircle } from "lucide-react"

interface TaskStatusBadgeProps {
  status: string
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: AlertCircle,
          className: "bg-gray-100 text-gray-800",
        }
      case "in_progress":
        return {
          label: "In Progress",
          icon: Wrench,
          className: "bg-blue-100 text-blue-800",
        }
      case "completed_pending_review":
        return {
          label: "Pending Review",
          icon: Clock,
          className: "bg-orange-100 text-orange-800",
        }
      case "approved":
        return {
          label: "Approved",
          icon: CheckCircle,
          className: "bg-green-100 text-green-800",
        }
      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className: "bg-red-100 text-red-800",
        }
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: "bg-gray-100 text-gray-800",
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={`${config.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
