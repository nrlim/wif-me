"use client";

import { ChevronDown, CircleDollarSign, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition, type ReactElement } from "react";
import { useCurrency } from "@/lib/currency/context";
import { formatIdrPerCurrency } from "@/lib/currency/formatters";
import type { CurrencyCode } from "@/lib/currency/rates";
import { cn } from "@/lib/utils/cn";

const CURRENCIES = [
  { code: "IDR" },
  { code: "SAR" },
  { code: "USD" },
] as const satisfies readonly { readonly code: CurrencyCode }[];

type CurrencySelectorProps = {
  readonly scrolled?: boolean;
};

export function CurrencySelector({ scrolled = false }: CurrencySelectorProps): ReactElement {
  const { currency, rates, ratesFetchedAt, ratesSource, setCurrency, refreshRates } = useCurrency();
  const t = useTranslations("Currency");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleRefresh(): void {
    startTransition(() => {
      void refreshRates({ force: true });
    });
  }

  const sourceLabel = ratesSource === "internet" ? t("latest") : ratesSource === "database" ? t("stored") : t("fallback");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex min-h-10 items-center gap-1.5 rounded-[9px] border px-3 text-xs font-extrabold transition",
          scrolled
            ? "border-[var(--border)] bg-white/72 text-[var(--charcoal)] hover:border-[var(--emerald)]"
            : "border-[#f6ead3]/24 bg-[#f6ead3]/10 text-[#fff7e6] hover:bg-[#f6ead3]/16"
        )}
        aria-expanded={isOpen}
      >
        <CircleDollarSign className="size-3.5 text-[var(--gold-light)]" aria-hidden="true" />
        {currency}
        <ChevronDown className={cn("size-3.5", scrolled ? "text-[var(--text-muted)]" : "text-[#f6ead3]/70")} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[12px] border border-[var(--border)] bg-white p-2 text-[var(--charcoal)] shadow-[0_18px_50px_rgba(21,35,29,0.16)]">
          <div className="flex items-start justify-between gap-3 px-2 py-2">
            <div>
              <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">{t("title")}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{sourceLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="grid size-8 place-items-center rounded-[8px] border border-[var(--border)] text-[var(--emerald)] transition hover:bg-[var(--emerald-pale)] disabled:opacity-50"
              disabled={isPending}
              aria-label={t("refresh")}
            >
              <RefreshCw className={isPending ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            </button>
          </div>

          {CURRENCIES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setCurrency(item.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-[9px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--ivory)] ${
                currency === item.code ? "bg-[var(--emerald-pale)] text-[var(--emerald)]" : "text-[var(--charcoal)]"
              }`}
            >
              <span>
                <span className="block text-sm font-black">{item.code}</span>
                <span className="block text-xs text-[var(--text-muted)]">{t(`labels.${item.code}`)}</span>
              </span>
              {item.code !== "IDR" ? (
                <span className="text-right text-[0.68rem] font-bold text-[var(--text-muted)]">
                  {formatIdrPerCurrency(item.code, rates)}
                </span>
              ) : null}
            </button>
          ))}

          {ratesFetchedAt ? (
            <p className="px-2 pb-1 pt-2 text-[0.66rem] font-semibold text-[var(--text-muted)]">
              {t("updated")}: {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ratesFetchedAt))}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
