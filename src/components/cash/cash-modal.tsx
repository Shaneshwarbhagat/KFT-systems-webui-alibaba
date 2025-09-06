"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { Checkbox } from "../ui/checkbox";
import { useToast } from "../../hooks/use-toast";
import { cashApi, currencyApi, invoiceApi } from "../../lib/api";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useEffect, useState } from "react";
import { convertFromHKD, convertToHKD } from "../../lib/utils";
import { Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";

const cashSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required("Invoice number is required"),
  customerId: Yup.string().notRequired(),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  currency: Yup.string().required("Currency is required"),
  pickedBy: Yup.string().required("Picked by is required"),
  cashPickupDate: Yup.date().required("Pickup date is required"),
  pickupTime: Yup.string().required("Pickup time is required"),
});

interface CashFormValues {
  invoiceNumber: string;
  customerId: string;
  amount: number | string;
  currency: string;
  pickedBy: string;
  cashPickupDate: string;
  pickupTime: string;
  partialDelivery: boolean;
}

interface CashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cash?: any;
}

export function CashModal({ open, onOpenChange, cash }: CashModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState({
    customerName: "",
    paymentStatus: "",
    remainingAmount: 0,
  });
  const [currencyRates, setCurrencyRates] = useState({
    hkdToMop: 1.03,
    hkdToCny: 0.93,
  });

  // Fetch currency rates
  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: currencyApi.getCurrencies,
    enabled: open,
  });

  // Fetch invoices
  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceApi.getInvoices(),
    enabled: open,
  });

  useEffect(() => {
    if (currencies?.currency?.[0]) {
      const currencyData = currencies.currency[0];
      setCurrencyRates({
        hkdToMop: currencyData.hkdToMop || 1.03,
        hkdToCny: currencyData.hkdToCny || 0.93,
      });
    }
  }, [currencies]);

  // Get maximum allowed amount in selected currency
  const getMaxAllowedAmount = (currency: string, remainingAmountHKD: number) => {
    return convertFromHKD(remainingAmountHKD, currency, currencyRates);
  };

  // Check if amount equals remaining amount (full payment)
  const isFullPayment = (amount: number, currency: string, remainingAmountHKD: number) => {
    const amountInHKD = convertToHKD(amount, currency, currencyRates);
    return Math.abs(amountInHKD - remainingAmountHKD) < 0.01;
  };

  // Validate amount against remaining amount
  const validateAmount = (amount: number, currency: string, remainingAmountHKD: number) => {
    const amountInHKD = convertToHKD(amount, currency, currencyRates);
    return amountInHKD <= remainingAmountHKD;
  };

  const createMutation = useMutation({
    mutationFn: cashApi.createCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast({
        title: "Success",
        description: t('cashMangement.cashReceiptCreatedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t('cashMangement.failedToCreateCashReceipt'),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      cashApi.updateCash(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast({
        title: "Success",
        description: t('cashMangement.cashReceiptUpdatedSuccessfully'),
        className: "bg-success text-white [&_button]:text-white",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t('cashMangement.failedToUpdateCashReceipt'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    const submitData = {
      ...values,
      receiptNumber: `REC-${values?.invoiceNumber}`,
      amount: Number(values.amount),
    };

    if (cash) {
      updateMutation.mutate({ id: cash.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handlePartialPaymentChange = (
    checked: any,
    setFieldValue: any,
    values: any,
    selectedInvoiceDetails: any
  ) => {
    setFieldValue("partialDelivery", checked);
    // const remainingAmountHKD = selectedInvoiceDetails.remainingAmount;
    // if (!checked) {
    //   // If unchecking partial payment, set to full remaining amount
    //   const amountInCurrency = getMaxAllowedAmount(values.currency, remainingAmountHKD);
    //   setFieldValue("amount", amountInCurrency.toFixed(2));
    // }
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any,
    values: any,
    selectedInvoiceDetails: any
  ) => {
    const inputValue = e.target.value;
    // Allow empty value or valid numbers
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      setFieldValue("amount", inputValue);
    }
  };

  const handleAmountBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    setFieldValue: any,
    values: any,
    selectedInvoiceDetails: any
  ) => {
    const amount = parseFloat(e.target.value);
    if (isNaN(amount)) {
      setFieldValue("amount", "");
      return;
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;
    const remainingAmountHKD = selectedInvoiceDetails.remainingAmount;

    // Validate amount doesn't exceed remaining amount
    if (!validateAmount(roundedAmount, values.currency, remainingAmountHKD)) {
      const maxAllowed = getMaxAllowedAmount(values.currency, remainingAmountHKD);
      setFieldValue("amount", maxAllowed.toFixed(2));
      setFieldValue("partialDelivery", false);
      toast({
        title: "Warning",
        description: `${t('cashMangement.amounExceedsRemainingBalance1')} ${maxAllowed.toFixed(2)} ${values.currency} (${remainingAmountHKD.toFixed(2)} HKD)`,
        variant: "destructive",
      });
      return;
    }

    setFieldValue("amount", roundedAmount.toFixed(2));
    // Auto-handle partial delivery checkbox
    const isFullPaymentAmount = isFullPayment(roundedAmount, values.currency, remainingAmountHKD);
    setFieldValue("partialDelivery", !isFullPaymentAmount);
  };

  const handleCurrencyChange = (
    newCurrency: string,
    setFieldValue: any,
    values: any,
    selectedInvoiceDetails: any
  ) => {
    // If we're in create mode and no amount has been manually entered yet
    if (!cash && (!values.amount || values.amount === "")) {
      // Set to full remaining amount in new currency
      const remainingAmountHKD = selectedInvoiceDetails.remainingAmount;
      const amountInCurrency = getMaxAllowedAmount(newCurrency, remainingAmountHKD);
      setFieldValue("amount", amountInCurrency.toFixed(2));
      setFieldValue("partialDelivery", false);
    } 
    // If amount has been manually entered (create or edit mode)
    else if (values.amount && values.amount !== "") {
      // Convert the existing amount to the new currency
      const currentAmount = parseFloat(values.amount);
      const currentAmountHKD = convertToHKD(currentAmount, values.currency, currencyRates);
      const newAmount = convertFromHKD(currentAmountHKD, newCurrency, currencyRates);
      setFieldValue("amount", newAmount.toFixed(2));

      // Check if this is full payment
      const remainingAmountHKD = selectedInvoiceDetails.remainingAmount;
      const isFullPaymentAmount = isFullPayment(newAmount, newCurrency, remainingAmountHKD);
      setFieldValue("partialDelivery", !isFullPaymentAmount);
    }

    setFieldValue("currency", newCurrency);
  };

  useEffect(() => {
    setSelectedInvoiceDetails({
      customerName: "",
      paymentStatus: "",
      remainingAmount: 0,
    });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cash ? t('cashMangement.modal.editTitle') : t('cashMangement.modal.title')}
          </DialogTitle>
        </DialogHeader>

        <Formik<CashFormValues>
          initialValues={{
            invoiceNumber: cash?.invoiceNumber || "",
            customerId: cash?.customerId || "",
            amount: cash?.amount ? Number.parseFloat(cash.amount).toFixed(2) : "",
            currency: cash?.currency || "HKD",
            pickedBy: cash?.pickedBy || "",
            cashPickupDate:
              cash?.cashPickupDate || new Date().toISOString().split("T")[0],
            pickupTime:
              cash?.pickupTime || new Date().toTimeString().slice(0, 5),
            partialDelivery: cash?.partialDelivery || false,
          }}
          validationSchema={cashSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => {
            useEffect(() => {
              if (values.invoiceNumber) {
                const invoice = invoices?.invoices?.find(
                  (inv: any) => inv.invoiceNumber === values.invoiceNumber
                );
                if (invoice) {
                  const remainingAmountHKD = Number.parseFloat(invoice?.remainingAmount) || 0;
                  const details = {
                    customerName:
                      invoice?.customer?.companyName ||
                      invoice?.customer?.contactPersonName ||
                      "No customer found",
                    paymentStatus: remainingAmountHKD === 0 ? "complete" : "partial",
                    remainingAmount: remainingAmountHKD,
                  };
                  setSelectedInvoiceDetails(details);
                  setFieldValue("customerId", invoice.customerId);
                  
                  // Only auto-set amount in create mode when first loading or invoice changes
                  if (!cash && remainingAmountHKD > 0 && !values.amount) {
                    const amountInCurrency = getMaxAllowedAmount(values.currency, remainingAmountHKD);
                    setFieldValue("amount", amountInCurrency.toFixed(2));
                    setFieldValue("partialDelivery", false);
                  }
                  if (values.amount) {
                    const currentAmount = parseFloat(String(values.amount));
                    if (!validateAmount(currentAmount, values.currency, remainingAmountHKD)) {
                      const maxAllowed = getMaxAllowedAmount(values.currency, remainingAmountHKD);
                      setFieldValue("amount", maxAllowed.toFixed(2));
                      setFieldValue("partialDelivery", false);
                      // Only show toast in edit mode to avoid spamming during create
                      if (cash) {
                        toast({
                          title: "Warning",
                          description: `${t('cashMangement.amountAdjustedToMaximumAllowedValueOf')} ${maxAllowed.toFixed(2)} ${values.currency}`,
                          variant: "destructive",
                        });
                      }
                    }
                  }
                }
              }
            }, [open, cash, invoices, values.invoiceNumber, values.currency, currencyRates]);

            return (
              <Form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">{t('cashMangement.modal.cashReceiptInvoiceNumber')}</Label>
                    <Select
                      value={values.invoiceNumber}
                      onValueChange={(value) => {
                        setFieldValue("invoiceNumber", value);
                        setFieldValue("amount", "");
                      }}
                      disabled={!!cash}
                    >
                      <SelectTrigger className={`${cash ? "bg-gray-100 dark:bg-gray-800" : ""}`}>
                        <SelectValue placeholder={t('cashMangement.modal.selectInvoice')} />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices?.invoices?.map((invoice: any) => (
                          <SelectItem
                            key={invoice.id}
                            value={invoice.invoiceNumber}
                            disabled={invoice.remainingAmount <= 0 && !cash?.invoiceNumber}
                          >
                            {invoice.invoiceNumber} {invoice.remainingAmount <= 0 && "(Fulfilled)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.invoiceNumber && touched.invoiceNumber && (
                      <p className="text-sm text-red-500">
                        {errors.invoiceNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickedBy">{t('cashMangement.modal.inputPickedBy')}</Label>
                    <Field
                      as={Input}
                      id="pickedBy"
                      name="pickedBy"
                      placeholder={t('cashMangement.modal.pesronName')}
                      disabled={selectedInvoiceDetails.paymentStatus === "complete" || !selectedInvoiceDetails.customerName}
                      className={
                        `${errors.pickedBy && touched.pickedBy ? "border-red-500" : ""} 
                        ${(selectedInvoiceDetails.paymentStatus === "complete") || (!selectedInvoiceDetails.customerName) ? "bg-gray-100 dark:bg-gray-800" : ""
                        }`}
                    />
                    {errors.pickedBy && touched.pickedBy && (
                      <p className="text-sm text-red-500">{errors.pickedBy}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerId">{t('cashMangement.modal.cashReceiptCustomerName')}</Label>
                  <Input
                    value={selectedInvoiceDetails.customerName}
                    placeholder={t('cashMangement.modal.customerNamewillAutoPopulate')}
                    readOnly
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      {cash ? values.partialDelivery ? t('cashMangement.modal.delvieredAmount') : t('cashMangement.modal.needToDeliverAmount') : values.partialDelivery ? t('cashMangement.modal.CashAmount') : t('cashMangement.modal.totalAmountToPay')} {t('in')} {values.currency}
                    </Label>
                    <Field
                      as={Input}
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                        handleAmountBlur(e, setFieldValue, values, selectedInvoiceDetails);
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleAmountChange(e, setFieldValue, values, selectedInvoiceDetails);
                      }}
                      placeholder="0.00"
                      disabled={
                        (selectedInvoiceDetails.paymentStatus === "complete" && !cash) || 
                        (!selectedInvoiceDetails.customerName && !cash) || 
                        selectedInvoiceDetails.remainingAmount <= 0
                      }
                      className={`no-arrows 
                        ${errors.amount && touched.amount ? "border-red-500" : ""} 
                        ${(selectedInvoiceDetails.paymentStatus === "complete" && !cash) || 
                          (!selectedInvoiceDetails.customerName && !cash) || 
                          selectedInvoiceDetails.remainingAmount <= 0 ? "bg-gray-100 dark:bg-gray-800" : ""
                        }`}
                    />
                    {selectedInvoiceDetails.remainingAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        {t('remainingAmount')}: {getMaxAllowedAmount(values.currency, selectedInvoiceDetails.remainingAmount).toFixed(2)} {values.currency}
                        {values.currency !== "HKD" && (
                          <span> ({selectedInvoiceDetails.remainingAmount.toFixed(2)} HKD)</span>
                        )}
                      </div>
                    )}
                    {errors.amount && touched.amount && (
                      <p className="text-sm text-red-500">{errors.amount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">{t('cashMangement.modal.inputCurrency')}</Label>
                    <Select
                      value={values.currency}
                      onValueChange={(newCurrency) => {
                        handleCurrencyChange(newCurrency, setFieldValue, values, selectedInvoiceDetails);
                      }}
                      disabled={
                        (selectedInvoiceDetails.paymentStatus === "complete" && !cash) || 
                        (!selectedInvoiceDetails.customerName && !cash) || 
                        selectedInvoiceDetails.remainingAmount <= 0
                      }
                    >
                      <SelectTrigger className={`${
                        (selectedInvoiceDetails.paymentStatus === "complete" && !cash) || 
                        (!selectedInvoiceDetails.customerName && !cash) || 
                        selectedInvoiceDetails.remainingAmount <= 0 ? "bg-gray-100 dark:bg-gray-800" : ""
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HKD">HKD</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                        <SelectItem value="MOP">MOP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="partialDelivery"
                    checked={values.partialDelivery}
                    onCheckedChange={(checked) => {
                      handlePartialPaymentChange(checked, setFieldValue, values, selectedInvoiceDetails);
                    }}
                    disabled={
                      (selectedInvoiceDetails.paymentStatus === "complete" && !cash) || 
                      (!selectedInvoiceDetails.customerName && !cash) || 
                      selectedInvoiceDetails.remainingAmount <= 0 
                      // isFullPayment(
                      //   values.amount ? parseFloat(values.amount) : 0,
                      //   values.currency,
                      //   selectedInvoiceDetails.remainingAmount
                      // )
                    }
                  />
                  <Label htmlFor="partialDelivery">{t('partialPayment')}</Label>
                </div>
                <div className="text-xs italic text-gray-600 dark:text-gray-400 mb-4">
                  {t('cashMangement.modal.checkmarkIfPartialPaymentAndAddAmount')}
                </div>
                {selectedInvoiceDetails.paymentStatus === "complete" && (
                  <div className="text-xs text-green-600">
                    {t('cashMangement.modal.fullPaymentDone')}
                  </div>
                )}

                {/* <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime">Pickup Time</Label>
                    <Field
                      as={Input}
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      className={
                        errors.pickupTime && touched.pickupTime
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.pickupTime && touched.pickupTime && (
                      <p className="text-sm text-red-500">
                        {errors.pickupTime}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashPickupDate">Pickup Date</Label>
                    <Field
                      as={Input}
                      id="cashPickupDate"
                      name="cashPickupDate"
                      type="date"
                      className={
                        errors.cashPickupDate && touched.cashPickupDate
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.cashPickupDate && touched.cashPickupDate && (
                      <p className="text-sm text-red-500">
                        {errors.cashPickupDate}
                      </p>
                    )}
                  </div>
                </div> */}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || selectedInvoiceDetails.remainingAmount <= 0 || selectedInvoiceDetails.remainingAmount.toFixed(2) <= "0.00"}
                    className="bg-brand-primary hover:bg-brand-dark text-white"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        {cash ? t('updatingText') : t('creatingText')}
                      </>
                    ) : cash ? (
                      t('update')
                    ) : (
                      t('create')
                    )}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}