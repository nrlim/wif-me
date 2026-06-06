"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils/cn";
import { CurrencySelector } from "@/components/shared/currency-selector";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function SiteHeader(): ReactElement {
  const t = useTranslations("Header");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => setIsScrolled(window.scrollY > 18);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[100] transition-colors duration-300">
      <div
        className={cn(
          "flex h-16 w-full items-center justify-between border-b px-5 transition-all duration-300 sm:px-8 lg:h-[68px] lg:px-10",
          isScrolled
            ? "border-[var(--border)] bg-[rgba(255,250,240,0.92)] shadow-[0_8px_28px_rgba(21,35,29,0.08)] backdrop-blur-xl"
            : "border-white/12 bg-[rgba(7,43,30,0.38)] backdrop-blur-md"
        )}
      >
        <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="Wif-Me beranda">
          <div className="relative size-8 overflow-hidden rounded-[8px] bg-white/94 ring-1 ring-white/30">
            <Image src="/logo-icon.png" alt="Wif-Me" fill sizes="32px" className="object-cover" priority />
          </div>
          <span
            className={cn(
              "text-[1.05rem] font-black tracking-[-0.03em] transition-colors",
              isScrolled ? "text-[var(--charcoal)]" : "text-[#fff7e6]"
            )}
          >
            Wif<span className={isScrolled ? "text-[var(--gold)]" : "text-[var(--gold-light)]"}>-Me</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 min-[900px]:flex">
          <Link href="/" className={cn("text-sm font-bold transition-colors duration-200", isScrolled ? "text-[#3d4a43] hover:text-[var(--emerald)]" : "text-[#f6ead3]/86 hover:text-white")}>{t("home")}</Link>
          <Link href="#layanan" className={cn("text-sm font-bold transition-colors duration-200", isScrolled ? "text-[#3d4a43] hover:text-[var(--emerald)]" : "text-[#f6ead3]/86 hover:text-white")}>{t("services")}</Link>
          <Link href="#search" className={cn("text-sm font-bold transition-colors duration-200", isScrolled ? "text-[#3d4a43] hover:text-[var(--emerald)]" : "text-[#f6ead3]/86 hover:text-white")}>{t("search")}</Link>
        </nav>

        <div className="hidden items-center gap-3 min-[900px]:flex">
          <CurrencySelector scrolled={isScrolled} />
          <LanguageSwitcher scrolled={isScrolled} />
          <Link
            href="/login"
            className={cn(
              "inline-flex min-h-10 items-center rounded-[9px] border px-4 text-sm font-extrabold transition duration-200",
              isScrolled
                ? "border-[var(--border)] bg-white/76 text-[var(--charcoal)] hover:border-[var(--emerald)] hover:text-[var(--emerald)]"
                : "border-[#f6ead3]/28 bg-[#f6ead3]/10 text-[#fff7e6] hover:bg-[#fff7e6] hover:text-[var(--emerald)]"
            )}
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className={cn(
              "inline-flex min-h-10 items-center rounded-[9px] px-4 text-sm font-extrabold transition duration-200",
              isScrolled
                ? "bg-[var(--emerald)] text-white hover:bg-[var(--emerald-light)]"
                : "bg-[#f1c66a] text-[#153325] hover:bg-[#ffe0a0]"
            )}
          >
            {t("register")}
          </Link>
        </div>
      </div>
    </header>
  );
}
