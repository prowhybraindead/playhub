import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string, locale = "en-US") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      maximumFractionDigits: currencyCode.toUpperCase() === "VND" ? 0 : 2
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode.toUpperCase()}`;
  }
}
