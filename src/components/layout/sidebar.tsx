"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { useAuth } from "../../hooks/use-auth"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Calendar,
  UserCog,
  Truck,
} from "lucide-react"
import { useTranslation } from "react-i18next"

export function Sidebar() {
  const { t } = useTranslation();

  const navigation = [
    {
      name: t("menu.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Executive"]
    },
    {
      name: t("menu.invoices"),
      href: "/dashboard/invoices",
      icon: FileText,
      roles: ["Admin", "Executive"]
    },
    {
      name: t("menu.deliveryOrder"),
      href: "/dashboard/orders",
      icon: Truck,
      roles: ["Admin", "Executive"]
    },
    {
      name: t("menu.cashReceipt"),
      href: "/dashboard/cash",
      icon: Receipt,
      roles: ["Admin", "Executive"]
    },
    {
      name: t("menu.customerManagement"),
      href: "/dashboard/customers",
      icon: Users,
      roles: ["Admin"]
    },
    { name: t("menu.userManagement"), 
      href: "/dashboard/user-management", 
      icon: UserCog, 
      roles: ["Admin"],
    },
    {
      name: t("menu.expectedPaymentDate"),
      href: "/dashboard/expected-payments",
      icon: Calendar,
      roles: ["Admin", "Executive"]
    },
  ]

  const location = useLocation()
  const { user } = useAuth()
  // Show all navigation items if user is not loaded yet (prevents sidebar from disappearing on reload)
  const userRole = user?.role || "Admin" // Default to Admin to show all items during loading
  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-brand-primary/20 transition-all duration-300 shadow-lg",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-primary to-brand-secondary">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="../../../KFT-logo.png" alt= "KFT management systems logo" className="w-[22%] bg-white border-2 border-[#c6c6c6] rounded-sm"/>
            <h2 className="text-lg font-bold text-white">KFT System</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/20"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-brand-menu-bg text-brand-primary border border-brand-primary/20 shadow-sm"
                    : "text-brand-dark hover:bg-brand-light hover:text-brand-primary",
                  collapsed && "justify-center px-2",
                )}
              >
                <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">KFT Management v1.0</div>
        </div>
      )}
    </div>
  )
}
