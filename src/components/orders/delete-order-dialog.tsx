"use client"

import { useTranslation } from "react-i18next"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeleteOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orderNumber: string
  isLoading: boolean
}

export function DeleteOrderDialog({ isOpen, onClose, onConfirm, orderNumber, isLoading }: DeleteOrderDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">{t("Orders.deleteOrder")}</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {t("Orders.thisActionCannotBeUndone")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            {t("Orders.orderDeleteConfirmText1")} <span className="font-semibold text-gray-900">{orderNumber}</span>?
            {t("Orders.orderDeleteConfirmText2")}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t("deletingText") : t("Orders.deleteOrder")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
