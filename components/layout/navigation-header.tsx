"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Activity, LogOut, Settings, User } from "lucide-react"

export function NavigationHeader() {
  const { profile, signOut } = useAuth()

  const getRoleColor = (role: string) => {
    switch (role) {
      case "business_owner":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "accounting":
        return "bg-green-100 text-green-800"
      case "line_crew":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "business_owner":
        return "Business Owner"
      case "admin":
        return "Administrator"
      case "accounting":
        return "Accounting"
      case "line_crew":
        return "Line Crew"
      default:
        return role
    }
  }

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Aircraft Detailing System</h1>
            <p className="text-sm text-muted-foreground">Professional fleet management and operations</p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>

            {profile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {profile.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{profile.full_name}</p>
                      <Badge className={`text-xs ${getRoleColor(profile.role)}`}>{getRoleLabel(profile.role)}</Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
