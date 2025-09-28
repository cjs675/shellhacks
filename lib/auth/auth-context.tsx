"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase/client"

export type UserRole = "line_crew" | "admin"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  employee_id?: string
  phone?: string
  hire_date?: string
  status: "active" | "inactive" | "pending"
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: any }>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
        setPermissions([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)

      // Fetch user permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("user_id", userId)

      if (permissionsError) throw permissionsError

      setPermissions(permissionsData.map((p) => p.permission))
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = "line_crew") => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false

    // Admins have all permissions
    if (profile.role === "admin") return true

    // Check specific permissions
    return permissions.includes(permission)
  }

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false

    if (Array.isArray(role)) {
      return role.includes(profile.role)
    }

    return profile.role === role
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    isRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
