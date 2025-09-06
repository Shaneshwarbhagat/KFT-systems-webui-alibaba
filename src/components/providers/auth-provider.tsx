"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { authApi } from "../../lib/api"

interface User {
  id: string
  email: string
  name?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          // Validate token by making a test API call
          try {
            const userEmail = localStorage.getItem("userEmail")
            const userName = localStorage.getItem("userName")
            const userRole = localStorage.getItem("userRole")

            if (userEmail) {
              setUser({
                id: "1",
                email: userEmail,
                name: userName || "User",
                role: userRole || "--"
              })
            }
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem("token")
            localStorage.removeItem("userEmail")
            localStorage.removeItem("userName")
            localStorage.removeItem("userRole")
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      // console.log("Login response:", response)

      if (response.success && response.token) {
        localStorage.setItem("token", response.token)
        localStorage.setItem("userEmail", email)
        localStorage.setItem("userName", response.user?.name || "User")
        localStorage.setItem("userPhone", response.user?.phoneNo || "--")
        localStorage.setItem("userRole", response.user?.role || "--")

        setUser({
          id: response.user?.userId || "1",
          email: email,
          name: response.user?.name || "User",
          role: response.user?.role || "",
        })
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw new Error(error.response?.data?.message || error.message || "Login failed")
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("userPhone")
      localStorage.removeItem("userRole")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
