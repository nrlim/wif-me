"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Bell, Search, User, KeyRound, LogOut, ChevronDown, CheckCheck, Clock } from "lucide-react";
import { ROLE_NAV_ITEMS } from "@/lib/constants/navigation";

const DASHBOARD_ROLES = ["jamaah", "muthawif", "provider", "admin"] as const;

type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export function DashboardHeader() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.header");
  const navT = useTranslations("Dashboard.nav");
  const currentRole: DashboardRole = DASHBOARD_ROLES.find((role) => pathname.startsWith(`/${role}`)) ?? "jamaah";
  
  const navItems = ROLE_NAV_ITEMS[currentRole as keyof typeof ROLE_NAV_ITEMS] || [];
  const allNavLinks = navItems.flatMap((item) => {
    const main = [{ label: navT(item.labelKey), href: item.href, icon: item.icon }];
    const children = item.children ? item.children.map(child => ({ label: navT(child.labelKey), href: child.href, icon: child.icon })) : [];
    return item.children ? children : main;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  const searchResults = allNavLinks.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-white/82 px-3 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex flex-1 justify-end md:justify-between gap-x-3 self-stretch lg:gap-x-6">
        <form className="relative hidden flex-1 md:flex" ref={searchRef} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search-field" className="sr-only">{t("searchLabel")}</label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Cari menu navigasi..."
            type="search"
            name="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          {isSearchOpen && allNavLinks.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border)] bg-white py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden max-h-[60vh] overflow-y-auto">
              {(searchQuery ? searchResults : allNavLinks).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--charcoal)] transition-colors hover:bg-[var(--emerald)]/10 hover:text-[var(--emerald)]"
                  >
                    <Icon className="size-4 shrink-0 text-[var(--emerald)] opacity-70" />
                    {item.label}
                  </Link>
                );
              })}
              {searchQuery && searchResults.length === 0 && (
                <div className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">
                  Menu tidak ditemukan
                </div>
              )}
            </div>
          )}
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative" ref={notifRef}>
            <button 
              type="button" 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative -m-2.5 p-2.5 text-gray-400 hover:text-[var(--emerald)] transition-colors"
            >
              <span className="sr-only">{t("notifications")}</span>
              <Bell className="size-6" aria-hidden="true" />
              <span className="absolute top-2.5 right-2.5 flex size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] origin-top-right rounded-xl border border-[var(--border)] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 focus:outline-none">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <p className="text-sm font-extrabold text-[var(--charcoal)]">Notifikasi</p>
                  <button type="button" className="text-xs font-bold text-[var(--emerald)] hover:text-[var(--emerald-light)] transition-colors">Tandai sudah dibaca</button>
                </div>
                <div className="divide-y divide-[var(--border)] max-h-56 overflow-y-auto">
                  <div className="flex items-start gap-3 p-3 hover:bg-[var(--emerald-pale)]/50 transition-colors cursor-pointer">
                    <div className="flex size-9 mt-0.5 shrink-0 items-center justify-center rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)]">
                      <Clock className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--charcoal)] truncate">Booking Baru #INV-2024</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">Ada permintaan booking muthawif baru dari Budi Santoso.</p>
                      <p className="mt-1 text-[11px] font-bold text-[var(--emerald)]">5 menit yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-[var(--emerald-pale)]/50 transition-colors cursor-pointer opacity-70">
                    <div className="flex size-9 mt-0.5 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                      <CheckCheck className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--charcoal)] truncate">Pembayaran Berhasil</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">Dana sebesar SAR 1,500 telah masuk ke escrow.</p>
                      <p className="mt-1 text-[11px] font-bold text-[var(--text-muted)]">2 jam yang lalu</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] p-2">
                  <button type="button" className="w-full rounded-lg px-3 py-2 text-center text-xs font-bold text-[var(--emerald)] transition-all hover:bg-[var(--emerald)]/10">
                    Lihat Semua Notifikasi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          <div className="relative" ref={dropdownRef}>
            <button 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex min-h-11 items-center gap-x-3 rounded-2xl px-1.5 py-1 transition hover:bg-[var(--dashboard-secondary)] md:px-2"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-[var(--emerald)] text-xs font-bold text-white shadow-sm">
                {t(`roles.${currentRole}`).charAt(0).toUpperCase()}
              </div>
              <span className="hidden items-center gap-2 text-sm font-bold leading-6 text-gray-900 lg:flex">
                {t("userName", { role: t(`roles.${currentRole}`) })}
                <ChevronDown className="size-4 text-gray-500" aria-hidden="true" />
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-[var(--border)] bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-extrabold text-[var(--charcoal)]">{t("userName", { role: t(`roles.${currentRole}`) })}</p>
                  <p className="text-xs font-bold text-[var(--text-muted)] truncate">{t(`roles.${currentRole}`)}</p>
                </div>
                <div className="p-2">
                  <Link 
                    href={`/${currentRole}/profile`} 
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[var(--charcoal)] transition-all hover:bg-[var(--emerald)]/10 hover:text-[var(--emerald)]"
                  >
                    <User className="size-4 shrink-0 text-gray-400 group-hover:text-[var(--emerald)]" />
                    {t("profileGeneral")}
                  </Link>
                  <Link 
                    href={`/${currentRole}/profile/security`} 
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-[var(--charcoal)] transition-all hover:bg-[var(--emerald)]/10 hover:text-[var(--emerald)]"
                  >
                    <KeyRound className="size-4 shrink-0 text-gray-400 group-hover:text-[var(--emerald)]" />
                    {t("changePassword")}
                  </Link>
                </div>
                <div className="border-t border-[var(--border)] p-2">
                  <Link 
                    href="/" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-50"
                  >
                    <LogOut className="size-4 shrink-0" />
                    {navT("logout")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
