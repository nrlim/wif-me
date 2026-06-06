import { getPrismaClient } from "@/lib/db/prisma";
import {
  EXCHANGE_RATE_CACHE_SECONDS,
  FALLBACK_RATES,
  type CurrencyCode,
  type ExchangeRatePayload,
  type ExchangeRates,
} from "@/lib/currency/rates";

export const runtime = "nodejs";

const TARGET_CURRENCIES = ["SAR", "USD"] as const satisfies readonly CurrencyCode[];
const INTERNET_RATE_URL = "https://open.er-api.com/v6/latest/IDR";
const CACHE_WINDOW_MS = EXCHANGE_RATE_CACHE_SECONDS * 1000;

type InternetRateResponse = {
  readonly result?: unknown;
  readonly rates?: unknown;
  readonly time_last_update_unix?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildFallbackPayload(): ExchangeRatePayload {
  return {
    baseCurrency: "IDR",
    rates: FALLBACK_RATES,
    fetchedAt: new Date().toISOString(),
    source: "fallback",
  };
}

async function getCachedRates(): Promise<ExchangeRatePayload | null> {
  try {
    const prisma = getPrismaClient();
    const rows = await prisma.exchangeRate.findMany({
      where: { baseCurrency: "IDR", targetCurrency: { in: ["SAR", "USD"] } },
      select: { targetCurrency: true, rate: true, fetchedAt: true },
    });

    if (rows.length !== TARGET_CURRENCIES.length) {
      return null;
    }

    const oldestFetchedAt = rows.reduce<Date>((oldest, row) => (row.fetchedAt < oldest ? row.fetchedAt : oldest), rows[0]?.fetchedAt ?? new Date(0));

    if (Date.now() - oldestFetchedAt.getTime() > CACHE_WINDOW_MS) {
      return null;
    }

    const rates: ExchangeRates = { ...FALLBACK_RATES };
    rows.forEach((row) => {
      rates[row.targetCurrency] = row.rate.toNumber();
    });

    return {
      baseCurrency: "IDR",
      rates,
      fetchedAt: oldestFetchedAt.toISOString(),
      source: "database",
    };
  } catch {
    return null;
  }
}

async function fetchInternetRates(forceRefresh: boolean): Promise<ExchangeRatePayload | null> {
  const response = await fetch(INTERNET_RATE_URL, {
    cache: forceRefresh ? "no-store" : undefined,
    headers: { Accept: "application/json" },
    next: forceRefresh ? undefined : { revalidate: EXCHANGE_RATE_CACHE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as InternetRateResponse;

  if (payload.result !== "success" || !isRecord(payload.rates)) {
    return null;
  }

  const sarRate = payload.rates.SAR;
  const usdRate = payload.rates.USD;

  if (typeof sarRate !== "number" || typeof usdRate !== "number") {
    return null;
  }

  return {
    baseCurrency: "IDR",
    rates: { IDR: 1, SAR: sarRate, USD: usdRate },
    fetchedAt: new Date().toISOString(),
    source: "internet",
  };
}

async function persistRates(payload: ExchangeRatePayload): Promise<void> {
  try {
    const prisma = getPrismaClient();
    const fetchedAt = new Date(payload.fetchedAt);

    await prisma.$transaction(
      TARGET_CURRENCIES.map((targetCurrency) =>
        prisma.exchangeRate.upsert({
          where: {
            baseCurrency_targetCurrency: {
              baseCurrency: "IDR",
              targetCurrency,
            },
          },
          create: {
            baseCurrency: "IDR",
            targetCurrency,
            rate: payload.rates[targetCurrency],
            fetchedAt,
          },
          update: {
            rate: payload.rates[targetCurrency],
            fetchedAt,
          },
        })
      )
    );
  } catch {
    // Do not expose persistence failures to clients. The API can still return fresh rates.
  }
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";

  if (!forceRefresh) {
    const cachedRates = await getCachedRates();

    if (cachedRates) {
      return Response.json(cachedRates, {
        headers: { "Cache-Control": `public, s-maxage=${EXCHANGE_RATE_CACHE_SECONDS}` },
      });
    }
  }

  try {
    const internetRates = await fetchInternetRates(forceRefresh);

    if (internetRates) {
      await persistRates(internetRates);

      return Response.json(internetRates, {
        headers: { "Cache-Control": forceRefresh ? "no-store" : `public, s-maxage=${EXCHANGE_RATE_CACHE_SECONDS}` },
      });
    }
  } catch {
    // Fall through to safe fallback.
  }

  return Response.json(buildFallbackPayload(), {
    headers: { "Cache-Control": "no-store" },
  });
}
