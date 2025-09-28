"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, Plus, Edit, Shield, Calendar } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  employee_id: string
  phone: string
  hire_date: string
  status: string
  created_at: string
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole={["admin", "business_owner"]}>
      <UsersContent />
    </ProtectedRoute>
  )
}

function UsersContent() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
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

  const getUsersByRole = (role: string) => {
    return users.filter((user) => user.role === role).length
  }

  return (
    <main className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">User Management</h2>
            <p className="text-muted-foreground">Manage team members, roles, and permissions.</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* User Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Line Crew</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUsersByRole("line_crew")}</div>
              <p className="text-xs text-muted-foreground">Technicians</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUsersByRole("admin")}</div>
              <p className="text-xs text-muted-foreground">Supervisors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="accounting">Accounting</SelectItem>
                  <SelectItem value="line_crew">Line Crew</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "No users match your filters."
                    : "No users found."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-sm">
                          {user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{user.full_name}</h4>
                          <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          {user.employee_id && <span>ID: {user.employee_id}</span>}
                          {user.phone && <span>Phone: {user.phone}</span>}
                          {user.hire_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Hired: {new Date(user.hire_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
