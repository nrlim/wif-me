export type CurrencyCode = "IDR" | "SAR" | "USD";

export type ExchangeRates = Record<CurrencyCode, number>;

export type ExchangeRateSource = "fallback" | "database" | "internet";

export type ExchangeRatePayload = {
  readonly baseCurrency: "IDR";
  readonly rates: ExchangeRates;
  readonly fetchedAt: string;
  readonly source: ExchangeRateSource;
};

export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = ["IDR", "SAR", "USD"];
export const EXCHANGE_RATE_CACHE_SECONDS = 21_600;

// Safe fallback. Base is IDR: 1 IDR = target currency value.
export const FALLBACK_RATES: ExchangeRates = {
  IDR: 1,
  SAR: 0.00024,
  USD: 0.000064,
};

export const RATES = FALLBACK_RATES;

export const RATES_DISPLAY = {
  SAR: Math.round(1 / FALLBACK_RATES.SAR),
  USD: Math.round(1 / FALLBACK_RATES.USD),
} as const;

export function isCurrencyCode(value: string | null): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((currency) => currency === value);
}
