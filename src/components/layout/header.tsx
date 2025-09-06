"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { useAuth } from "../../hooks/use-auth"
import {
  LogOut,
  Settings,
  User,
  Search,
  ChevronDown,
  DollarSign,
  FileText,
  Lock,
  Globe,
  UserPlus,
} from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { Input } from "../ui/input"
import { ProfileModal } from "../profile/profile-modal"
import { UpdateCurrencySection } from "../settings/update-currency-section"
import { MisReportSection } from "../settings/mis-report-section"
import { ChangePasswordSection } from "../settings/change-password-section"
import { LanguageSection } from "../settings/language-section"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface HeaderProps {
  onSearch?: (query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [activeSettingComponent, setActiveSettingComponent] = useState<string | null>(null)
  // const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    localStorage.clear()
    logout()
  }

  const handleSettingClick = (component: string) => {
    setActiveSettingComponent(component)
  }

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const query = e.target.value
  //   setSearchQuery(query)
  //   onSearch?.(query)
  // }

  const renderSettingComponent = () => {
    switch (activeSettingComponent) {
      case "currency":
        return <UpdateCurrencySection />
      case "mis":
        return <MisReportSection />
      case "password":
        return <ChangePasswordSection />
      case "language":
        return <LanguageSection />
      default:
        return null
    }
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('businessManagement')}</h1>

            {/* <div className="hidden md:flex items-center space-x-4 ml-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 w-80 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div> */}
          </div>

          <div className="flex items-center space-x-4">
            {/* <ThemeToggle /> */}

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-brand-light cursor-pointer"
                >
                  <Settings className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                {user?.role?.toLowerCase() === "admin" && <DropdownMenuItem
                  onClick={() => handleSettingClick("currency")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t('settings.updateCurrency')}
                </DropdownMenuItem>}
                <DropdownMenuItem
                  onClick={() => handleSettingClick("mis")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t('settings.misReport')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSettingClick("password")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {t('settings.changePassword')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSettingClick("language")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {t('settings.language')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br  from-brand-primary to-brand-secondary text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <p className="text-xs leading-none text-brand-secondary font-medium">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => setShowProfile(true)}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal open={showProfile} onOpenChange={setShowProfile} />

      {/* Settings Modal */}
      <Dialog open={!!activeSettingComponent} onOpenChange={() => setActiveSettingComponent(null)}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">{t('settings.settingsTitle')}</DialogTitle>
          </DialogHeader>
          <div className="text-gray-900 dark:text-gray-100">{renderSettingComponent()}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
