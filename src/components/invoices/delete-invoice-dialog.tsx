"use client"

import { useTranslation } from "react-i18next"
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

interface DeleteInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any
  onConfirm: () => void
  isLoading: boolean
}

export function DeleteInvoiceDialog({ open, onOpenChange, invoice, onConfirm, isLoading }: DeleteInvoiceDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-white">{t("invoices.deleteInvoice")}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            {t("invoices.deleteInvoiceConfirm1")} <span className="font-semibold text-gray-900">"{invoice?.invoiceNumber}"</span>? {t("invoices.deleteInvoiceConfirm2")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? t("deletingText") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
