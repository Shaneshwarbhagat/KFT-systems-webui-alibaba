"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { invoiceApi, customerApi, currencyApi } from "../../lib/api";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { convertFromHKD } from "../../lib/utils";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Search } from "lucide-react"
import { useDebounce } from "../../hooks/use-debounce"
import { useTranslation } from "react-i18next";

interface InvoiceFormValues {
  invoiceNumber: string;
  customerId: string;
  amount: number | string;
  currency: string;
  invoiceDate: Date | null;
  totalUnits: number | string;
}

interface InvoiceEditFormValues {
  amount: number | string;
  currency: string;
}

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
  onSuccess: () => void;
}

export function InvoiceModal({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: InvoiceModalProps) {
  const { t } = useTranslation();
  const [currencyRates, setCurrencyRates] = useState({ hkdToMop: 1.03, hkdToCny: 0.93 });
  const [customerSearch, setCustomerSearch] = useState("")
  const debouncedCustomerSearch = useDebounce(customerSearch, 300)
  const { toast } = useToast();
  const isEditing = !!invoice;

  const invoiceSchema = Yup.object().shape({
    invoiceNumber: isEditing
      ? Yup.string().notRequired()
      : Yup.string().required("Invoice number is required"),
    customerId: isEditing
      ? Yup.string().notRequired()
      : Yup.string().required("Customer is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    currency: Yup.string().required("Currency is required"),
    invoiceDate: Yup.date().required("Invoice date is required"),
    // totalUnits: Yup.number()
    //   .positive("Units must be positive")
    //   .required("Total units is required"),
  });

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getCustomers(),
    enabled: open
  });

  const { data: currencyData } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => currencyApi.getCurrencies(), // Update to your actual API
  });

useEffect(() => {
  if (currencyData?.currency?.[0]) {
    setCurrencyRates({
      hkdToMop: currencyData.currency[0].hkdToMop || 1.03,
      hkdToCny: currencyData.currency[0].hkdToCny || 0.93,
    });
  }
}, [currencyData]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (values: any) => {
      if (isEditing) {
        return invoiceApi.updateInvoice(invoice.id, values);
      } else {
        return invoiceApi.createInvoice(values);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Invoice ${
          isEditing ? t("updated") : t("created")
        } ${t("successfully")}`,
        className: "bg-success text-white [&_button]:text-white",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to ${isEditing ? t("update") : t("create")} ${t("invoice")}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    // const currentDate = new Date().toISOString().split(".")[0] + "Z";
    const createPayload = { ...values,
      // invoiceDate: currentDate,
      amount: Number(values.amount), 
      totalUnits: 0 
    };
    const { invoiceNumber, ...remainingProperties} = createPayload;
    if (isEditing) {
      mutation.mutate(remainingProperties);
    } else {
      mutation.mutate(createPayload);
    }
  };

  const customers = customersData?.customers || [];

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    const result = customers.filter((customer: any) => {
      const searchTerm = debouncedCustomerSearch.toLowerCase()
      const companyName = (customer.companyName || "").toLowerCase()
      const contactName = (customer.contactPersonName || "").toLowerCase()
      return companyName.includes(searchTerm) || contactName.includes(searchTerm)
    })
    return result
  }, [debouncedCustomerSearch, customers]);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setCustomerSearch("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {isEditing ? t("invoices.editInvoiceButton") : t("invoices.modal.title")}
          </DialogTitle>
        </DialogHeader>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Formik<InvoiceFormValues>
            initialValues={{
              invoiceNumber: invoice?.invoiceNumber || "",
              customerId: invoice?.customerId || "",
              amount: parseFloat(invoice?.amount).toFixed(2) || "",
              currency: invoice?.currency || "HKD",
              invoiceDate: invoice?.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
              totalUnits: invoice?.totalUnits || 0,
            }}
            validationSchema={invoiceSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditing ? (
                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                      {t("invoices.modal.invoiceEditInvoiceNumber")}:{" "}
                      <span className="text-gray-700 dark:text-gray-300">
                        <b>{invoice?.invoiceNumber || ""}</b>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceNumber"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {t("invoices.modal.inputInvoiceNumber")}
                      </Label>
                      <Field
                        as={Input}
                        id="invoiceNumber"
                        name="invoiceNumber"
                        placeholder={t("invoices.modal.enterInvoiceNumber")}
                        className={`dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                          errors.invoiceNumber && touched.invoiceNumber
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {errors.invoiceNumber && touched.invoiceNumber && (
                        <p className="text-sm text-red-500">
                          {errors.invoiceNumber}
                        </p>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="bg-gray-50 mt-2 p-4 rounded-lg">
                      {t("invoices.modal.invoiceEditCustomerName")}:{" "}
                      <span className="text-gray-700 dark:text-gray-300">
                        <b>{invoice?.customer?.companyName || invoice?.customer?.contactPersonName || ""}</b>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="customerId" className="text-gray-700 dark:text-gray-300">
                        {t("invoices.modal.inputCustomer")}
                      </Label>
                      <Select value={values.customerId} onValueChange={(value) => setFieldValue("customerId", value)}>
                        <SelectTrigger
                          className={`dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                            errors.customerId && touched.customerId ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder={t('invoices.modal.selectCustomer')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center px-3 pb-2">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                              placeholder={t('searchCustomer')}
                              value={customerSearch}
                              onChange={(e) => setCustomerSearch(e.target.value)}
                              className="h-8 w-full bg-transparent focus:ring-0 focus:outline-none"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer: any) => (
                                <SelectItem
                                  key={customer.id}
                                  value={customer.id}
                                  className="text-gray-900 dark:text-gray-100"
                                >
                                  {customer.companyName || customer.contactPersonName}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                {t('noCustomersFound')}
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                      {errors.customerId && touched.customerId && (
                        <p className="text-sm text-red-500">{errors.customerId}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="amount"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {t("invoices.modal.numberAmount")}
                    </Label>
                    <Field
                      as={Input}
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.00"
                      placeholder="0.00"
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                        const rounded = parseFloat(e.target.value).toFixed(2);
                        setFieldValue("amount", rounded);
                      }}
                      className={`dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 no-arrows ${
                        errors.amount && touched.amount ? "border-red-500" : ""
                      }`}
                    />
                    {errors.amount && touched.amount && (
                      <p className="text-sm text-red-500">{errors.amount}</p>
                    )}
                    {values.currency !== 'HKD' && values.amount && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ≈ {convertFromHKD(Number(values.amount), values.currency, currencyRates).toFixed(2)} HKD
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="currency"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {t("invoices.modal.invoiceinputCurrency")}
                    </Label>
                    <Select
                      value={values.currency}
                      onValueChange={(value) => setFieldValue("currency", value)}
                    >
                      <SelectTrigger className="dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem
                          value="HKD"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          HKD
                        </SelectItem>
                        <SelectItem
                          value="MOP"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          MOP
                        </SelectItem>
                        <SelectItem
                          value="CNY"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          CNY
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">{t("invoices.modal.invoiceDate")}</Label>
                    <DatePicker
                        value={values.invoiceDate}
                        onChange={(date) => {
                          setFieldValue("invoiceDate", date);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!(
                              errors.invoiceDate &&
                              touched.invoiceDate
                            ),
                            helperText:
                              errors.invoiceDate &&
                              touched.invoiceDate
                                ? String(errors.invoiceDate)
                                : "",
                          },
                          popper: {
                            placement: "bottom-start",
                          },
                        }}
                        format="dd/MM/yyyy"
                        // disablePast
                      />
                  </div>
                  {/* <div className="space-y-2">
                    <Label
                      htmlFor="totalUnits"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Total Units *
                    </Label>
                    <Field
                      as={Input}
                      id="totalUnits"
                      name="totalUnits"
                      type="number"
                      placeholder="0"
                      className={`dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                        errors.totalUnits && touched.totalUnits
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {errors.totalUnits && touched.totalUnits && (
                      <p className="text-sm text-red-500">{errors.totalUnits}</p>
                    )}
                  </div> */}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 bg-brand-primary hover:bg-brand-dark text-white"
                  >
                    {mutation.isPending
                      ? t("SavingText")
                      : isEditing
                      ? t("invoices.updateInvoiceButton")
                      : t("invoices.createInvoiceButton")}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
}
