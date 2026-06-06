import { FALLBACK_RATES, type CurrencyCode, type ExchangeRates } from "./rates";

export function formatCurrency(
  amountIdr: number,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates = FALLBACK_RATES
): string {
  const converted = amountIdr * rates[targetCurrency];

  return new Intl.NumberFormat(targetCurrency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: targetCurrency === "IDR" ? 0 : 2,
  }).format(converted);
}

export function formatIdrPerCurrency(targetCurrency: Exclude<CurrencyCode, "IDR">, rates: ExchangeRates): string {
  const targetRate = rates[targetCurrency];
  const idrPerTarget = targetRate > 0 ? Math.round(1 / targetRate) : 0;

  return `1 ${targetCurrency} = ${new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(idrPerTarget)}`;
}
