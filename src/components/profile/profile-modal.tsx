"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Card, CardContent } from "../ui/card"
import { useAuth } from "../../hooks/use-auth"
import { User, Mail, Phone, Shield, Calendar } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth()

  // Get user data from localStorage (from login response)
  const userData = {
    name: localStorage.getItem("userName") || user?.name || "N/A",
    email: localStorage.getItem("userEmail") || user?.email || "N/A",
    role: localStorage.getItem("userRole") || user?.role || "N/A",
    phone: localStorage.getItem("userPhone") || "N/A",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profileModal.title')}
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('profileModal.name')}</p>
                  <p className="text-sm text-gray-600">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('profileModal.email')}</p>
                  <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('profileModal.role')}</p>
                  <p className="text-sm text-gray-600">{userData.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('profileModal.phoneNumber')}</p>
                  <p className="text-sm text-gray-600">{userData.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
