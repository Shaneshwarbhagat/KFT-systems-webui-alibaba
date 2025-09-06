"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { cashApi } from "../../lib/api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { CashModal } from "../../components/cash/cash-modal";
import { DeleteCashDialog } from "../../components/cash/delete-cash-dialog";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { useAuth } from "../../hooks/use-auth";
import { formatCurrency } from "../../lib/utils";
import { useDebounce } from "../../hooks/use-debounce";
import { useTranslation } from "react-i18next";

export default function CashPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("")
  const debouncedCashSearch = useDebounce(search, 500);
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCash, setSelectedCash] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cashToDelete, setCashToDelete] = useState<any>(null);
  const limit = 10
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Fetch cash list
  const { data: cashData, isLoading } = useQuery({
    queryKey: ["cash", page, debouncedCashSearch],
    queryFn: () => cashApi.getCashList({ page: page, limit, search: debouncedCashSearch }),
  });

  const total = cashData?.total || 0
  const totalPages = Math.ceil(total / limit)

  const processedCashData = useMemo(() => {
    if (!cashData?.data) return [];
    // Sort cash data based on sortField and sortOrder
    const sortedCash = [...cashData.data].sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sortedCash;
  }, [cashData, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleEdit = (cash: any) => {
    setSelectedCash(cash);
    setShowModal(true);
  };

  const handleDelete = (cash: any) => {
    setCashToDelete(cash);
    setShowDeleteDialog(true);
  };

  const handleCreate = () => {
    setSelectedCash(null);
    setShowModal(true);
  };

  const handlePrint = (cash: any) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cash Receipt - ${cash.receiptNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: white;
            }
            
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .company-details {
              font-size: 14px;
              margin: 5px 0px 10px;
            }
            
            .receipt-title {
              font-size: 16px;
              font-weight: bold;
              margin-top: 15px;
              text-decoration: underline;
            }
            
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
            }
            
            .receipt-left, .receipt-right {
              width: 48%;
            }
            
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            
            .info-label {
              font-weight: bold;
              width: 120px;
              display: inline-block;
            }
            
            .info-value {
              flex: 1;
            }
            
            .amount-section {
              margin: 30px 0;
              padding: 15px;
              border: 2px solid #000;
              text-align: center;
            }
            
            .amount-label {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .amount-value {
              font-size: 20px;
              font-weight: bold;
            }
            
            .payment-details {
              margin: 20px 0;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
            }
            
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            
            .signature-box {
              width: 200px;
              text-align: center;
            }
            
            .signature-line {
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
              height: 40px;
            }
            
            @media print {
              body { margin: 0; }
              .receipt-container { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-name">Korean-fashion International Trading Limited</div>
              <div class="company-details">Address: Flat L, 7/F, Block 2, ED. KeckSeng Industrial Building, 146-173 Avenida.de Venceslau De Morais, Macau</div>
              <div class="company-details">Contact No: +853 - 62074090</div>
              <div class="receipt-title">CASH RECEIPT</div>
            </div>
            
            <div class="receipt-info">
              <div class="receipt-left">
                <div class="info-row">
                  <span class="info-label">Receipt No:</span>
                  <span class="info-value">${cash.receiptNumber || "--"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Invoice No:</span>
                  <span class="info-value">${cash.invoiceNumber|| "--"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Client Name (Customer):</span>
                  <span class="info-value">${cash.customer.companyName || "--"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Picked By:</span>
                  <span class="info-value">${cash.pickedBy || "--"}</span>
                </div>
              </div>
              
              <div class="receipt-right">
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${new Date(
                    cash.cashPickupDate
                  ).toLocaleDateString("en-GB")}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${cash.pickupTime || "--"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Currency:</span>
                  <span class="info-value">${cash.currency || 'HKD'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Type:</span>
                  <span class="info-value">${
                    cash.partialDelivery ? "Partial Payment" : "Full Payment"
                  }</span>
                </div>
              </div>
            </div>
            
            <div class="amount-section">
              <div class="amount-label">AMOUNT RECEIVED</div>
              <div class="amount-value">${cash.currency} ${formatCurrency(cash.amount)}</div>
            </div>
            
            <div class="payment-details">
              <div class="section-title">Payment Details:</div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">Cash</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount in HKD:</span>
                <span class="info-value">${formatCurrency(cash.amountInHkd) || '--'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${
                  cash.partialDelivery ? "Partial Payment" : "Payment Complete"
                }</span>
              </div>
            </div>
            
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div>Received By</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div>Customer Signature</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>This is a computer generated receipt.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("cashMangement.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("cashMangement.subTitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 sm:gap-5">
          <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("cashMangement.searchCashReceipts")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("cashMangement.addCashReceipt")}
          </Button>
        </div>
      </div>

      {processedCashData?.length !== 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('cashMangement.table.tableTitle')}</CardTitle>
              <div className="flex items-center space-x-2">
                {t('cashMangement.modal.totalReceipts')}: &nbsp;
                <span className="font-semibold">{cashData?.total || 0}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead>{t("cashMangement.table.cashReceiptNumber")}</TableHead>
                    <TableHead>{t("cashMangement.table.cashInvoiceNumber")}</TableHead>
                    <TableHead>{t("cashMangement.table.cashCustomer")}</TableHead>
                    <TableHead onClick={() => handleSort("amount")} className="cursor-pointer flex items-center justify-between">
                      {t("cashMangement.table.cashAmountReceived")} {getSortIcon("amount")}
                    </TableHead>
                    <TableHead>{t("cashMangement.table.amountIn")} HKD</TableHead>
                    <TableHead onClick={() => handleSort("pickedBy")}>
                      <div className="cursor-pointer flex items-center justify-between flex-diredction-row">
                        {t("cashMangement.table.cashPickedBy")} <span className="ml-1">{getSortIcon("pickedBy")}</span>
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort("cashPickupDate")} className="cursor-pointer flex items-center justify-between">
                      {t("cashMangement.table.cashPickedDate")} {getSortIcon("cashPickupDate")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("partialDelivery")}>
                      <div className="cursor-pointer flex items-center justify-between flex-diredction-row">
                        {t("cashMangement.table.cashPickedStatus")} <span>{getSortIcon("partialDelivery")}</span>
                      </div>
                    </TableHead>
                    {isAdmin && <TableHead>{t("cashMangement.table.cashActions")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedCashData?.map((cash: any) => (
                    <TableRow key={cash.id}>
                      <TableCell className="font-medium">
                        {cash.receiptNumber}
                      </TableCell>
                      <TableCell>{cash.invoiceNumber}</TableCell>
                      <TableCell>
                        {cash.customer?.companyName || "--"}
                      </TableCell>
                      <TableCell>
                        <b>{formatCurrency(cash.amount)}</b> <Badge variant="outline"> {cash.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(cash?.amountInHkd) || "--"}
                      </TableCell>
                      <TableCell><b>{cash.pickedBy}</b></TableCell>
                      <TableCell>{formatDate(cash.cashPickupDate)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cash.partialDelivery ? "default" : "secondary"
                          }
                          className={
                            cash.partialDelivery
                              ? "bg-brand-secondary text-white"
                              : ""
                          }
                        >
                          {cash.partialDelivery ? "Partial" : "Complete"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(cash)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cash)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(cash)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t('showing')} {(page - 1) * limit + 1} {t('to')} {Math.min(page * limit, total)} {t('of')} {total} {t('users')}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('page')} {page} {t('of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('cashMangement.noCashReceiptFound')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('cashMangement.getStartedByCreatingYourFirstCashReceipt')}
          </p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('cashMangement.addCashReceipt')}
          </Button>
        </Card>
      )}

      {/* Modals */}
      <CashModal
        open={showModal}
        onOpenChange={setShowModal}
        cash={selectedCash}
      />

      <DeleteCashDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        cash={cashToDelete}
      />
    </div>
  );
}
