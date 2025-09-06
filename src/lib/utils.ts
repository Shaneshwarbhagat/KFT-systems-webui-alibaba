import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: string) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency) {
    const currencySymbol = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).formatToParts(0).find(part => part.type === "currency")?.value || "";
    return `${currencySymbol} ${formattedAmount}`
  } else {
    return formattedAmount;
  }
}

export function formatDate(date: string | Date) {
  const dateObj = new Date(date)
  const day = dateObj.getDate().toString().padStart(2, "0")
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0")
  const year = dateObj.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

interface icurrencies { 
  hkdToMop: number, 
  hkdToCny: number 
}

export const convertFromHKD = (hkdAmount: number, currency: string, currencyRates: icurrencies): number => {
  if (currency === "HKD") return hkdAmount;
  if (currency === "MOP") return hkdAmount * currencyRates.hkdToMop;
  if (currency === "CNY") return hkdAmount * currencyRates.hkdToCny;
  return hkdAmount;
};

export const convertToHKD = (amount: number, currency: string, currencyRates: icurrencies): number => {
  if (currency === "HKD") return amount;
  if (currency === "MOP") return amount / currencyRates.hkdToMop;
  if (currency === "CNY") return amount / currencyRates.hkdToCny;
  return amount;
};
