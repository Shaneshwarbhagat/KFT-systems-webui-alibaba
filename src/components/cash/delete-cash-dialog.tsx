"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { useToast } from "../../hooks/use-toast"
import { cashApi } from "../../lib/api"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useTranslation } from "react-i18next"

interface DeleteCashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cash: any
}

export function DeleteCashDialog({ open, onOpenChange, cash }: DeleteCashDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cashApi.deleteCash(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast({
        title: "Success",
        description: t('cashMangement.cashReceiptDeletedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white"
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: t('cashMangement.failedToDeleteCashReceipt'),
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    if (cash?.id) {
      deleteMutation.mutate(cash.id)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('cashMangement.cashReceiptDeleteDescription1')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('cashMangement.cashReceiptDeleteDescription2')} 
            <strong> {cash?.receiptNumber}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t('deletingText')}
              </>
            ) : (
              t('delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
