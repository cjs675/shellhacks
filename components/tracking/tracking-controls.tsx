"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Settings, Play, Pause, RefreshCw, Download } from "lucide-react"

interface Aircraft {
  id: string
  tail_number: string
  icao24_address: string
  tracking_enabled: boolean
}

interface TrackingControlsProps {
  aircraft: Aircraft[]
}

export function TrackingControls({ aircraft }: TrackingControlsProps) {
  const [autoRefresh, setAutoRefresh] = useState(true)

  const activeCount = aircraft.filter((a) => a.tracking_enabled).length
  const totalCount = aircraft.length

  return (
    <div className="flex items-center gap-4">
      <Badge variant="outline">
        {activeCount}/{totalCount} tracking
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Controls
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Auto-refresh
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Auto-refresh
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Export Flight Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
