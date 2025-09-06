"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";
import { invoiceApi } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { InvoiceModal } from "../../components/invoices/invoice-modal";
import { DeleteInvoiceDialog } from "../../components/invoices/delete-invoice-dialog";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { getIn } from "formik";
import Tooltip from "@mui/material/Tooltip";
import { useDebounce } from "../../hooks/use-debounce";
import { useTranslation } from "react-i18next";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedInvoiceSearch = useDebounce(searchQuery, 600)
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Fetch invoices and payment status in parallel
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["invoices", currentPage, debouncedInvoiceSearch],
    queryFn: () =>
      invoiceApi.getInvoices({
        page: currentPage,
        limit: 10,
        search: debouncedInvoiceSearch,
      }),
  });

  const invoices = invoicesData?.invoices || [];
  const totalPages = Math.ceil((invoicesData?.total || 0) / 10);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: invoiceApi.deleteInvoice,
    onSuccess: () => {
      toast({
        title: "Success",
        description: t("invoices.invoiceDeletedSuccessfully"),
        className: "bg-success text-white [&_button]:text-white",
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setDeletingInvoice(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || t("invoices.failedToDeleteInvoice"),
        variant: "destructive",
      });
    },
  });

  const getStatus = (remainingAmt: number, totalAmt: number) => {
    if (remainingAmt === 0) {
      return (
        <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-500">
          Complete
        </Badge>
      );
    }
    if (totalAmt !== 0) {
      return (
        <Badge
          variant="default"
          className="bg-brand-secondary text-white hover:bg-brand-secondary">
          Partial
        </Badge>
      );
    }
    if (totalAmt === 0) {
      return (
        <Badge className="text-white bg-red-500 hover:bg-red-500">
          Incomplete
        </Badge>
      );
    }
  };

  // frontend sorting
  const processedInvoice = useMemo(() => {
    const sortedInvoices = [...invoices].sort((a, b) => {
    const aValue = getIn(a, sortField);
    const bValue = getIn(b, sortField);

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  return sortedInvoices;
  },[invoices, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handlePrint = (invoice: any) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .company-details { 
              font-size: 14px; 
              line-height: 1.5; 
            }
            .client-section {
              margin: 20px 0;
              display: flex;
              justify-content: space-between;
            }
            .client-info, .note-info {
              width: 48%;
            }
            .section-header {
              font-weight: bold;
              background-color: #f0f0f0;
              padding: 8px;
              border: 1px solid #333;
              text-align: center;
            }
            .section-content {
              padding: 8px;
              border: 1px solid #333;
              border-top: none;
              min-height: 40px;
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .invoice-table th, .invoice-table td { 
              padding: 10px; 
              border: 1px solid #333; 
              text-align: left;
            }
            .invoice-table th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            .footer-info {
              margin-top: 30px;
              font-size: 12px;
              line-height: 1.6;
            }
            .totals {
              margin-top: 20px;
              text-align: left;
            }
            .totals div {
              margin: 5px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Korean-fashion International Trading Limited</div>
            <div class="company-details">
              Address: Flat L, 7/F, Block 2, ED. KeckSeng Industrial Building, 146-173 Avenida.de Venceslau De Morais, Macau<br>
              Contact No: +853 - 62074090<br>
              Date: ${new Date().toLocaleDateString()}<br>
              Invoice#: ${invoice.invoiceNumber}
            </div>
          </div>

          <div class="client-section">
            <div class="client-info">
              <div class="section-header">CLIENT</div>
              <div class="section-content">
                ${
                  invoice.customer?.companyName ||
                  invoice.customer?.contactPersonName ||
                  "N/A"
                }
              </div>
            </div>
            <div class="note-info">
              <div class="section-header">NOTE</div>
              <div class="section-content">
                ${invoice.notes || ""}
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL ${invoice.currency || "HKD"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>Cognac/Whiskey/Wine</td>
                <td>${invoice.units || 1}</td>
                <td>${formatCurrency(invoice.amount || 0)}</td>
                <td>${formatCurrency(invoice.amountInHkd || 0)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-info">
            <div class="totals">
              <div><strong>SUB TOTAL: ${formatCurrency(invoice.amount || 0)}</strong></div>
              <div><strong>DISCOUNT: -</strong></div>
              <div><strong>Amount due ${
                invoice.currency || "HKD"
              }: ${formatCurrency(invoice.amountInHkd || 0)}</strong></div>
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
            {t("invoices.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("invoices.subTitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 sm:gap-5">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("invoices.SearchInvoices")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-80 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("invoices.addInvoiceButton")}
          </Button>
        </div>
      </div>

      {processedInvoice?.length !== 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">
                {t("invoices.table.invoiceTableTitle")}
              </CardTitle>
              <div className="flex items-center space-x-2">
              <div>
                {t("invoices.totalInvoices")}: &nbsp;
                <span className="font-semibold text-gray-900 dark:text-white">
                  {" "}
                  {invoicesData?.total || 0}
                </span>
              </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead
                      className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("invoiceDate")}
                    >
                      <div className="flex items-center">
                        {t("invoices.table.invoiceDate")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        {t("invoices.table.invoiceNumber")}
                      </div>
                    </TableHead>
                    {/* <TableHead>
                      <div className="flex items-center">
                        {t("invoices.table.invoiceCustomerEmailId")}
                      </div>
                    </TableHead> */}
                    {/* <TableHead>
                      <div className="flex items-center">
                        {t("invoices.table.invoiceCustomerMobileNo")}
                      </div>
                    </TableHead> */}
                    <TableHead
                      className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("customer.companyName")}
                    >
                      <div className="flex items-center">
                        {t("invoices.table.invoiceCustomer")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center">
                        {t("invoices.table.invoiceAmount")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      {t("invoices.table.invoiceCurrency")}
                    </TableHead>
                    {/* <TableHead className="text-gray-700 dark:text-gray-300">
                      Units
                    </TableHead> */}
                    <TableHead>
                      <div className="flex items-center">
                        {t("invoices.table.invoiceTotalAmount")} HKD
                      </div>
                    </TableHead>
                    <TableHead>
                      {t("invoices.table.invoiceTotalPaidAmt")} (HKD)
                    </TableHead>
                    <TableHead>
                      {t("invoices.table.invoiceTotalRemiainingAmt")} (HKD)
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("expectedPaymentDate")}
                    >
                      <div className="flex items-center">
                        {t("invoices.table.invoiceExpectedPaymentDate")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        {t("invoices.table.invoicePaymentStatus")}
                      </div>
                    </TableHead>
                   
                    <TableHead>
                      {t("invoices.table.invoiceActions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedInvoice && processedInvoice.length ? (
                    processedInvoice.map((invoice: any) => (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {new Date(invoice.invoiceDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoiceNumber}
                        </TableCell>
                        {/* <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.customer?.emailId}
                        </TableCell> */}
                        {/* <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.customer?.mobileNumber}
                        </TableCell> */}
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.customer?.companyName || invoice.customer?.contactPersonName}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100 font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                          >
                            {invoice.currency}
                          </Badge>
                        </TableCell>
                        {/* <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.totalUnits}
                        </TableCell> */}
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {formatCurrency(invoice.amountInHkd)}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {formatCurrency(invoice.totalPaidAmount)}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {formatCurrency(invoice.remainingAmount)}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.expectedPaymentDate
                            ? new Date(
                                invoice.expectedPaymentDate
                              ).toLocaleDateString("en-GB")
                            : "--"}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {getStatus(
                            invoice.remainingAmount,
                            invoice.totalPaidAmount
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={invoice.remainingAmount === 0 ? true : false}
                                  onClick={() => setEditingInvoice(invoice)}
                                  className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 [&[disabled]]:cursor-not-allowed [&[disabled]]:opacity-50 [&[disabled]]:pointer-events-auto`}
                                >
                                  <Tooltip title={invoice.remainingAmount === 0 ? "Not allowed to edit as payment is completed" : ""}>
                                    <Edit className="h-4 w-4" />
                                  </Tooltip>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingInvoice(invoice)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(invoice)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <div className="p-5">{t("invoices.NoInvoiceFound")}.</div>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t("showing")} {(currentPage - 1) * 10 + 1} {t("to")}{" "}
                  {Math.min(currentPage * 10, invoicesData?.total || 0)} {t("of")}{" "}
                  {invoicesData?.total || 0} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {t("previous")}
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t("page")} {currentPage} {t("of")} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {t("next")}
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
            {t("invoices.NoInvoiceFound")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("invoices.getstartedByCreatingYourFirstInvoice")}
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("invoices.addInvoiceButton")}
          </Button>
        </Card>
      )}

      {/* Modals */}
      <InvoiceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
          setShowCreateModal(false);
        }}
      />

      <InvoiceModal
        open={!!editingInvoice}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
        invoice={editingInvoice}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
          setEditingInvoice(null);
        }}
      />

      <DeleteInvoiceDialog
        open={!!deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
        invoice={deletingInvoice}
        onConfirm={() =>
          deletingInvoice && deleteMutation.mutate(deletingInvoice.id)
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
