"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, currencyApi, invoiceApi } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useTranslation } from "react-i18next";

interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  partialDelivery: boolean;
  deliveredBy: string;
  amountOfDelivery: string;
  currency: string;
  customerId: string;
  customer: {
    companyName: string;
    contactPersonName: string;
  };
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function EditOrderModal({
  isOpen,
  onClose,
  order,
}: EditOrderModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    deliveryStatus: false,
    deliveredBy: "",
    deliveredValue: "",
    currency: "HKD",
  });

  const [currencyRates, setCurrencyRates] = useState({
    hkdToMop: 1.03,
    hkdToCny: 0.93,
  });

  const [remainingAmountHKD, setRemainingAmountHKD] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && order) {
      setIsLoading(true);
      
      // Fetch currency rates
      currencyApi.getCurrencies().then((data) => {
        if (data?.currency?.[0]) {
          setCurrencyRates({
            hkdToMop: data.currency[0].hkdToMop,
            hkdToCny: data.currency[0].hkdToCny,
          });
        }

        // Fetch invoice to get remaining amount
        return invoiceApi.getInvoices();
      }).then((invoiceData) => {
        const invoice = invoiceData.invoices.find(
          (inv: any) => inv.invoiceNumber === order.invoiceNumber
        );
        
        if (invoice) {
          setRemainingAmountHKD(invoice.remainingAmount);
        }
      }).catch(error => {
        toast({
          title: "Error",
          description: t("Orders.failedLoadInvoiceDetails"),
          variant: "destructive",
        });
      }).finally(() => {
        setIsLoading(false);
      });

      setFormData({
        deliveryStatus: order.partialDelivery,
        deliveredBy: order.deliveredBy || "",
        deliveredValue: parseFloat(order.amountOfDelivery).toFixed(2),
        currency: order.currency,
      });
    }
  }, [isOpen, order, toast]);

  const convertFromHKD = (hkdAmount: number, currency: string) => {
    if (currency === "HKD") return hkdAmount;
    if (currency === "MOP") return hkdAmount * currencyRates.hkdToMop;
    if (currency === "CNY") return hkdAmount * currencyRates.hkdToCny;
    return hkdAmount;
  };

  const convertToHKD = (amount: number, currency: string) => {
    if (currency === "HKD") return amount;
    if (currency === "MOP") return amount / currencyRates.hkdToMop;
    if (currency === "CNY") return amount / currencyRates.hkdToCny;
    return amount;
  };

  const getRemainingAmountInCurrency = (currency: string) => {
    return convertFromHKD(remainingAmountHKD, currency);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      orderApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast({
        title: "Success",
        description: t("Orders.OrderSuccess"),
        className: "bg-success text-white [&_button]:text-white",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || t("Orders.FailedToUpdateOrder"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!order || !formData.deliveredValue || !formData.currency || !formData.deliveredBy ) {
      toast({
        title: "Error",
        description: t("Orders.modal.pleasefillAllRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    if (formData.deliveredValue === "0.00" || formData.deliveredValue === "0") {
      toast({
        title: "Error",
        description: t("Orders.deliveryAmountCannotbe0"),
        variant: "destructive",
      });
      return;
    }

    if (remainingAmountHKD <= 0) {
      toast({
        title: "Error",
        description: t("Orders.cannotUpdateOrder"),
        variant: "destructive",
      });
      return;
    }

    const amountInHKD = convertToHKD(Number(formData.deliveredValue), formData.currency);
    if (amountInHKD > remainingAmountHKD) {
      const maxInCurrency = convertFromHKD(remainingAmountHKD, formData.currency);
      toast({
        title: "Error",
        description: `${t("Orders.amountExceedsRemainingBalance")} ${maxInCurrency.toFixed(2)} ${formData.currency} (${remainingAmountHKD.toFixed(2)} HKD)`,
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      partialDelivery: formData.deliveryStatus,
      deliveredBy: formData.deliveredBy,
      amountOfDelivery: Number(parseFloat(formData.deliveredValue).toFixed(2)),
      currency: formData.currency,
      customerId: order.customerId,
      invoiceNumber: order.invoiceNumber,
    };

    updateMutation.mutate({ id: order.id, data: updateData });
  };

  const handleCurrencyChange = (value: string) => {
    const currentAmount = formData.deliveredValue ? Number(formData.deliveredValue) : 0;
    const currentAmountHKD = convertToHKD(currentAmount, formData.currency);
    const newAmount = convertFromHKD(currentAmountHKD, value);
    
    setFormData(prev => ({
      ...prev,
      currency: value,
      deliveredValue: newAmount.toFixed(2),
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        deliveredValue: value,
      }));
    }
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setFormData(prev => ({...prev, deliveredValue: ""}));
      return;
    }

    // Round to 2 decimal places
    value = Math.round(value * 100) / 100;
    
    const amountInHKD = convertToHKD(value, formData.currency);
    if (amountInHKD > remainingAmountHKD) {
      const maxInCurrency = convertFromHKD(remainingAmountHKD, formData.currency);
      value = maxInCurrency;
      toast({
        title: "Warning",
        description: `${t("Orders.amountAdjustedToMaximumValue")} ${maxInCurrency.toFixed(2)} ${formData.currency}`,
        variant: "destructive",
      });
    }

    setFormData(prev => ({
      ...prev,
      deliveredValue: value.toFixed(2),
    }));
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {t("Orders.modal.editOrder")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">{t("Orders.modal.editOrderinvoiceNumber")}:</span>
                <span className="text-gray-900">{order?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">{t("Orders.modal.editOrderCompanyName")}:</span>
                <span className="text-gray-900">
                  {order?.customer?.companyName}
                </span>
              </div>
            </div>

            {remainingAmountHKD <= 0 ? (
              <div className="bg-red-50 p-3 rounded-md text-red-600">
                {t("Orders.cannotUpdateOrder")}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">  
                  <div className="space-y-2">
                    <Label htmlFor="deliveredValue">{t("Orders.modal.orderedAmount")}</Label>
                    <Input
                      id="deliveredValue"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={formData.deliveredValue}
                      onChange={handleAmountChange}
                      onBlur={handleAmountBlur}
                      className="no-arrows"
                    />
                    <div className="text-xs text-gray-500">
                      {t("remainingAmount")}: {getRemainingAmountInCurrency(formData.currency).toFixed(2)} {formData.currency}
                      {formData.currency !== "HKD" && (
                        <span> ({remainingAmountHKD.toFixed(2)} HKD)</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("Orders.modal.selectCurrency")}</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("Orders.modal.selectCurrencyPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HKD">HKD</SelectItem>
                        <SelectItem value="MOP">MOP</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div> 
              
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("partialDelivery")}</Label>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-yes"
                          checked={formData.deliveryStatus === true}
                          onCheckedChange={() =>
                            setFormData(prev => ({...prev, deliveryStatus: true}))
                          }
                        />
                        <Label htmlFor="status-yes" className="text-sm font-normal">
                          {t("Orders.modal.orderPartialDelivery.yes")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-no"
                          checked={formData.deliveryStatus === false}
                          onCheckedChange={() =>
                            setFormData(prev => ({...prev, deliveryStatus: false}))
                          }
                        />
                        <Label htmlFor="status-no" className="text-sm font-normal">
                        {t("Orders.modal.orderPartialDelivery.no")}
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Orders.modal.orderDeliveredBy")}</Label>
                    <Input
                      id="deliveredBy"
                      placeholder={t("Orders.modal.OrderEnterName")}
                      value={formData.deliveredBy}
                      onChange={(e) =>
                        setFormData(prev => ({...prev, deliveredBy: e.target.value}))
                      }
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || remainingAmountHKD <= 0}
                className="bg-brand-primary hover:bg-brand-dark text-white"
              >
                {updateMutation.isPending ? t("updatingText") : t("Orders.update Order")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}