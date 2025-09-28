"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, Clock, AlertTriangle, History } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"

interface Aircraft {
  id: string
  tail_number: string
  manufacturer: string
  model: string
}

interface ServiceHistory {
  service_name: string
  service_category: string
  last_completed: string | null
  last_scheduled: string | null
  status: 'completed' | 'scheduled' | 'overdue' | 'never_serviced'
  days_since_service: number | null
  job_id: string | null
}

interface AircraftServiceHistoryProps {
  aircraft: Aircraft
}

const SERVICE_CATEGORIES = [
  'Full Interior Detailing',
  'Exterior Wash & Detail',
  'Brightwork Polishing',
  'Carpet Deep Cleaning',
  'Leather Conditioning',
  'Paint Seal Application'
]

export function AircraftServiceHistory({ aircraft }: AircraftServiceHistoryProps) {
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchServiceHistory()
  }, [aircraft.id])

  const fetchServiceHistory = async () => {
    try {
      setLoading(true)

      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('service_catalog')
        .select('*')
        .in('service_name', SERVICE_CATEGORIES)

      if (servicesError) throw servicesError

      // Get completed jobs for this aircraft
      const { data: completedJobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          scheduled_start,
          actual_end,
          status,
          job_services!inner(
            service_id,
            service_catalog!inner(
              service_name,
              service_category
            )
          )
        `)
        .eq('aircraft_id', aircraft.id)
        .in('status', ['completed', 'scheduled', 'in_progress'])
        .order('actual_end', { ascending: false })

      if (jobsError) throw jobsError

      // Process service history
      const history: ServiceHistory[] = services?.map(service => {
        const relatedJobs = completedJobs?.filter(job =>
          job.job_services?.some(js => js.service_catalog?.service_name === service.service_name)
        ) || []

        const completedJobs_filtered = relatedJobs.filter(job => job.status === 'completed')
        const scheduledJobs = relatedJobs.filter(job => ['scheduled', 'in_progress'].includes(job.status))

        const lastCompleted = completedJobs_filtered[0]
        const nextScheduled = scheduledJobs[0]

        let status: ServiceHistory['status'] = 'never_serviced'
        let daysSinceService = null

        if (lastCompleted?.actual_end) {
          const completedDate = new Date(lastCompleted.actual_end)
          const now = new Date()
          daysSinceService = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))

          if (nextScheduled) {
            status = 'scheduled'
          } else if (daysSinceService > getRecommendedInterval(service.service_name)) {
            status = 'overdue'
          } else {
            status = 'completed'
          }
        } else if (nextScheduled) {
          status = 'scheduled'
        }

        return {
          service_name: service.service_name,
          service_category: service.service_category,
          last_completed: lastCompleted?.actual_end || null,
          last_scheduled: nextScheduled?.scheduled_start || null,
          status,
          days_since_service: daysSinceService,
          job_id: lastCompleted?.id || nextScheduled?.id || null
        }
      }) || []

      setServiceHistory(history)
    } catch (error) {
      console.error('Error fetching service history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendedInterval = (serviceName: string): number => {
    // Recommended service intervals in days
    const intervals: Record<string, number> = {
      'Full Interior Detailing': 90, // 3 months
      'Exterior Wash & Detail': 30, // 1 month
      'Brightwork Polishing': 180, // 6 months
      'Carpet Deep Cleaning': 120, // 4 months
      'Leather Conditioning': 90, // 3 months
      'Paint Seal Application': 365 // 1 year
    }
    return intervals[serviceName] || 90
  }

  const getStatusColor = (status: ServiceHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'never_serviced':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ServiceHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'scheduled':
        return <Calendar className="h-4 w-4" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />
      case 'never_serviced':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: ServiceHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'Up to Date'
      case 'scheduled':
        return 'Scheduled'
      case 'overdue':
        return 'Overdue'
      case 'never_serviced':
        return 'Never Serviced'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Service History - {aircraft.tail_number}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {serviceHistory.map((service) => (
            <div key={service.service_name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{service.service_name}</h4>
                  <Badge className={getStatusColor(service.status)}>
                    {getStatusIcon(service.status)}
                    <span className="ml-1">{getStatusText(service.status)}</span>
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  {service.last_completed && (
                    <div className="flex items-center gap-4">
                      <span>Last Completed: {format(new Date(service.last_completed), 'MMM dd, yyyy')}</span>
                      {service.days_since_service !== null && (
                        <span>({service.days_since_service} days ago)</span>
                      )}
                    </div>
                  )}

                  {service.last_scheduled && (
                    <div>
                      Next Scheduled: {format(new Date(service.last_scheduled), 'MMM dd, yyyy')}
                    </div>
                  )}

                  {!service.last_completed && !service.last_scheduled && (
                    <div className="text-gray-500">No service history available</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {service.status === 'overdue' && (
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                    Schedule Service
                  </Button>
                )}
                {service.status === 'never_serviced' && (
                  <Button size="sm" variant="outline">
                    Schedule First Service
                  </Button>
                )}
                {service.job_id && (
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {serviceHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No service history available for this aircraft</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}