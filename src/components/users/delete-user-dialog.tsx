"use client"

import { Button } from "../ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useTranslation } from "react-i18next"

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
  isLoading: boolean
}

export function DeleteUserDialog({ isOpen, onClose, onConfirm, userName, isLoading }: DeleteUserDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="modal-content">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">{t('addUser.deleteUser')}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t('addUser.deleteUserDesc1')} "<span className="font-semibold text-gray-900">{userName}</span>"? {t('addUser.deleteUserDesc2')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {t('cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white min-w-24"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : t('delete')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
