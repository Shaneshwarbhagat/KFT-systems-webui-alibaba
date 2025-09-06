"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../lib/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { CustomerModal } from "../../components/customers/customer-modal";
import { DeleteCustomerDialog } from "../../components/customers/delete-customer-dialog";
import { formatDate } from "../../lib/utils";
import { useDebounce } from "../../hooks/use-debounce";
import { useTranslation } from "react-i18next";

interface Customer {
  id: string;
  address: string;
  city: string;
  country: string;
  contactPersonName: string;
  companyName: string;
  mobileNumber: string;
  emailId: string;
  businessRegistrationNumber: string;
  createdAt: string;
  updatedAt: string;
}

type SortField = keyof Customer | null;
type SortDirection = "asc" | "desc";

export default function CustomersPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedInvoiceSearch = useDebounce(searchTerm, 600)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const limit = 10;

  // Fetch customers
  const {
    data: customersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers", currentPage, debouncedInvoiceSearch],
    queryFn: () =>
      customerApi.getCustomers({
        page: currentPage,
        limit,
        search: debouncedInvoiceSearch,
      }),
  });

  const total = customersData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Process data for frontend search and sorting
  const processedCustomers = useMemo(() => {
    let result = customersData?.customers || [];

    // Frontend search
    // if (searchTerm) {
    //   const term = searchTerm.toLowerCase();
    //   result = result.filter(
    //     (customer: any) =>
    //       customer.companyName.toLowerCase().includes(term) ||
    //       customer.contactPersonName.toLowerCase().includes(term) ||
    //       customer.emailId.toLowerCase().includes(term) ||
    //       customer.city.toLowerCase().includes(term) ||
    //       customer.country.toLowerCase().includes(term) ||
    //       customer.businessRegistrationNumber.toLowerCase().includes(term)
    //   );
    // }

    // Frontend sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [customersData?.customers, debouncedInvoiceSearch, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: customerApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Success",
        description: t('addCustomer.customerDeletedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || t('addCustomer.failedToDeleteCustomer'),
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('addCustomer.errorLoadingCustomers')}
          </h3>
          <p className="text-gray-600">{t('pleaseTryAgainLater')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('addCustomer.title')}
          </h1>
          <p className="text-gray-600">{t('addCustomer.subtitle')}</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addCustomer.createCustomerButton')}
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* TO DO: Search is working with current 10 list shown */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('searchCustomer')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-gray-900 dark:text-white">
          {t('customers')} <span className="font-semibold">{total}</span> {t('customers')}
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('addCustomer.table.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : processedCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noCustomersFound')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('addCustomer.getStartedByCreatingYourFirstCustomer')}
              </p>
              <Button
                onClick={handleCreate}
                className="bg-brand-primary hover:bg-brand-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addCustomer.createCustomerButton')}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("companyName")}
                    >
                      <div className="flex items-center">
                        {t('addCustomer.table.cusotmerListcompanyName')}
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>{t('addCustomer.table.cusotmerListcontactPerson')}</TableHead>
                    <TableHead>{t('addCustomer.table.cusotmerListEmail')}</TableHead>
                    <TableHead>{t('addCustomer.table.cusotmerListCity')}</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("country")}
                    >
                      <div className="flex items-center">
                        {t('addCustomer.table.cusotmerListCountry')}
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>{t('addCustomer.table.cusotmerListBrn')}</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        {t('addCustomer.table.cusotmerListCreated')}
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("updatedAt")}
                    >
                      <div className="flex items-center">
                        {t('addCustomer.table.cusotmerListUpdated')}
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">{t('addCustomer.table.cusotmerListActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.companyName}
                      </TableCell>
                      <TableCell>{customer.contactPersonName}</TableCell>
                      <TableCell>{customer.emailId}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.country}</TableCell>
                      <TableCell>
                        {customer.businessRegistrationNumber}
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>{formatDate(customer.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(customer)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4 " />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(customer)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                {t('showing')} {(currentPage - 1) * limit + 1} {t('to')}{" "}
                {Math.min(currentPage * limit, total)} {t('of')} {total} {t('customers')}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('previous')}
                </Button>
                <span className="text-sm text-gray-600">
                  {t('page')} {currentPage} {t('of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        mode={modalMode}
      />

      <DeleteCustomerDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        customerName={selectedCustomer?.companyName || ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
