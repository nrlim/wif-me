"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  FALLBACK_RATES,
  isCurrencyCode,
  type CurrencyCode,
  type ExchangeRatePayload,
  type ExchangeRateSource,
  type ExchangeRates,
} from "./rates";

type CurrencyContextType = {
  readonly currency: CurrencyCode;
  readonly rates: ExchangeRates;
  readonly ratesFetchedAt: string | null;
  readonly ratesSource: ExchangeRateSource;
  readonly setCurrency: (currency: CurrencyCode) => void;
  readonly refreshRates: (options?: { readonly force?: boolean }) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function getInitialCurrency(): CurrencyCode {
  if (typeof window === "undefined") {
    return "IDR";
  }

  const savedCurrency = window.localStorage.getItem("wifme_currency");
  return isCurrencyCode(savedCurrency) ? savedCurrency : "IDR";
}

function isExchangeRatePayload(value: unknown): value is ExchangeRatePayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<ExchangeRatePayload>;

  return (
    payload.baseCurrency === "IDR" &&
    typeof payload.fetchedAt === "string" &&
    typeof payload.rates?.IDR === "number" &&
    typeof payload.rates.SAR === "number" &&
    typeof payload.rates.USD === "number" &&
    (payload.source === "fallback" || payload.source === "database" || payload.source === "internet")
  );
}

export function CurrencyProvider({ children }: { readonly children: ReactNode }): ReactElement {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency);
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [ratesFetchedAt, setRatesFetchedAt] = useState<string | null>(null);
  const [ratesSource, setRatesSource] = useState<ExchangeRateSource>("fallback");

  const refreshRates = useCallback(async (options?: { readonly force?: boolean }): Promise<void> => {
    const endpoint = options?.force ? "/api/currency/rates?refresh=1" : "/api/currency/rates";
    const response = await fetch(endpoint, {
      cache: options?.force ? "no-store" : "default",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return;
    }

    const payload: unknown = await response.json();

    if (!isExchangeRatePayload(payload)) {
      return;
    }

    setRates(payload.rates);
    setRatesFetchedAt(payload.fetchedAt);
    setRatesSource(payload.source);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshRates();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshRates]);

  const setCurrency = useCallback((nextCurrency: CurrencyCode): void => {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem("wifme_currency", nextCurrency);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{ currency, rates, ratesFetchedAt, ratesSource, setCurrency, refreshRates }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}
