"use client"

import type React from "react"

import { useAuth } from "../../hooks/use-auth"
import { Navigate, useLocation } from "react-router-dom"
import { LoadingSpinner } from "../ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner  size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if executive role is trying to access restricted pages
  if (user?.role?.toLowerCase() === "executive") {
    const restrictedPaths = ["/dashboard/customers", "/dashboard/user-management"]
    const currentPath = location.pathname

    if (restrictedPaths.some((path) => currentPath.startsWith(path))) {
      return <Navigate to="/dashboard" replace />
    }
  }

  // Check if specific role is required
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
