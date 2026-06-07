"use client";

import { BriefcaseBusiness, Building2, CreditCard, House, LayoutGrid, LogOut, Percent, ReceiptText, UserCheck, Users, WalletCards, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactElement } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

const ADMIN_PRIMARY_ITEMS = [
  { href: "/admin", labelKey: "roles.admin.overview", icon: House },
  { href: "/admin/services/categories", labelKey: "roles.admin.services", icon: BriefcaseBusiness },
  { href: "CENTER", labelKey: "more", icon: LayoutGrid },
  { href: "/admin/partners/muthawif", labelKey: "roles.admin.partners", icon: Users },
  { href: "/admin/transactions", labelKey: "roles.admin.transactions", icon: ReceiptText },
] as const;

const ADMIN_SHEET_ITEMS = [
  { href: "/admin", labelKey: "roles.admin.overview", icon: House },
  { href: "/admin/services/categories", labelKey: "roles.admin.serviceCategories", icon: BriefcaseBusiness },
  { href: "/admin/services/items", labelKey: "roles.admin.serviceItems", icon: LayoutGrid },
  { href: "/admin/partners/muthawif", labelKey: "roles.admin.muthawif", icon: UserCheck },
  { href: "/admin/partners/providers", labelKey: "roles.admin.providers", icon: Building2 },
  { href: "/admin/transactions", labelKey: "roles.admin.transactions", icon: ReceiptText },
  { href: "/admin/escrow/holding", labelKey: "roles.admin.escrowHolding", icon: WalletCards },
  { href: "/admin/escrow/withdrawals", labelKey: "roles.admin.withdrawals", icon: CreditCard },
  { href: "/admin/fees", labelKey: "roles.admin.fees", icon: Percent },
  { href: "/admin/charges", labelKey: "roles.admin.charges", icon: WalletCards },
] as const;

export function DashboardMobileNav(): ReactElement | null {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.nav");
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isAdmin) {
    return null;
  }

  const closeSheet = (): void => setIsOpen(false);

  return (
    <>
      <nav
        aria-label={t("mobileNav")}
        className="fixed inset-x-4 bottom-[calc(0.8rem+env(safe-area-inset-bottom))] z-50 flex h-[70px] items-center rounded-[18px] border border-white/70 bg-white/88 px-2 shadow-[0_14px_36px_rgba(22,33,28,0.14)] backdrop-blur-xl md:hidden"
      >
        {ADMIN_PRIMARY_ITEMS.map((item) => {
          if (item.href === "CENTER") {
            return (
              <div key={item.href} className="relative flex h-full w-[76px] items-center justify-center">
                <button
                  type="button"
                  aria-label={t("openMenu")}
                  onClick={() => setIsOpen(true)}
                  className="absolute -top-5 flex size-16 items-center justify-center rounded-full border-[5px] border-[var(--ivory)] bg-[var(--emerald)] text-white shadow-[0_12px_28px_rgba(27,107,74,0.34)] active:scale-95"
                >
                  <item.icon className="size-7" aria-hidden="true" />
                </button>
              </div>
            );
          }

          const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.63rem] font-extrabold",
                isActive ? "text-[var(--emerald)]" : "text-[var(--text-muted)]"
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              <span className="max-w-14 truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label={t("closeMenu")}
        className={cn("fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden", isOpen ? "block" : "hidden")}
        onClick={closeSheet}
      />

      <section
        aria-label={t("mainMenu")}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[70] rounded-t-[28px] bg-white px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_45px_rgba(22,33,28,0.18)] transition-transform duration-300 md:hidden",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[var(--border)]" />
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--gold)]">{t("mainMenu")}</p>
            <h2 className="mt-1 text-xl font-extrabold text-[var(--charcoal)]">{t("roles.admin.overview")}</h2>
          </div>
          <button type="button" onClick={closeSheet} className="flex size-11 items-center justify-center rounded-full bg-[var(--ivory)] text-[var(--text-muted)]">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ADMIN_SHEET_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeSheet} className="rounded-2xl border border-[var(--border)] bg-[var(--ivory)] p-4">
              <item.icon className="size-5 text-[var(--emerald)]" aria-hidden="true" />
              <p className="mt-3 text-sm font-extrabold text-[var(--charcoal)]">{t(item.labelKey)}</p>
            </Link>
          ))}
        </div>
        <Link href="/" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 text-sm font-extrabold text-red-700">
          <LogOut className="size-5" aria-hidden="true" />
          {t("logout")}
        </Link>
      </section>
    </>
  );
}
