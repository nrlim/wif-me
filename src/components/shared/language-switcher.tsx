"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent, ReactElement } from "react";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

type AppLocale = (typeof routing.locales)[number];

function isAppLocale(locale: string): locale is AppLocale {
  return routing.locales.some((supportedLocale) => supportedLocale === locale);
}

type LanguageSwitcherProps = {
  readonly scrolled?: boolean;
};

export function LanguageSwitcher({ scrolled = false }: LanguageSwitcherProps): ReactElement {
  const locale = useLocale();
  const t = useTranslations("Language");
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextLocale = event.target.value;

    if (isAppLocale(nextLocale)) {
      router.replace(pathname, { locale: nextLocale });
    }
  }

  return (
    <label
      className={cn(
        "flex min-h-10 items-center gap-1.5 rounded-[9px] border px-3 text-xs font-extrabold transition",
        scrolled
          ? "border-[var(--border)] bg-white/72 text-[var(--charcoal)] hover:border-[var(--emerald)]"
          : "border-[#f6ead3]/24 bg-[#f6ead3]/10 text-[#fff7e6] hover:bg-[#f6ead3]/16"
      )}
    >
      <Languages className="size-3.5 text-[var(--gold-light)]" aria-hidden="true" />
      <span className="sr-only">{t("select")}</span>
      <select
        value={locale}
        onChange={handleChange}
        className="cursor-pointer bg-transparent text-xs font-extrabold uppercase outline-none"
        aria-label={t("select")}
      >
        <option value="id" className="bg-white text-[var(--charcoal)]">ID</option>
        <option value="en" className="bg-white text-[var(--charcoal)]">EN</option>
        <option value="ar" className="bg-white text-[var(--charcoal)]">AR</option>
      </select>
    </label>
  );
}
