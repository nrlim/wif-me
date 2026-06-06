"use client";

import Link from "next/link";
import { useState, useEffect, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  House,
  Search,
  LayoutGrid,
  ClipboardList,
  LogIn,
  X,
  Info,
  CircleHelp,
  Star,
  Users,
} from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/#search", label: "Cari", icon: Search },
  { href: "CENTER", label: "Menu", icon: LayoutGrid }, // Placeholder for center button
  { href: "/#cara-kerja", label: "Panduan", icon: ClipboardList },
  { href: "/login", label: "Masuk", icon: LogIn },
] as const;

const BOTTOM_SHEET_ITEMS = [
  { href: "/#search", label: "Cari Muthawif", icon: Search },
  { href: "/#cara-kerja", label: "Cara Kerja", icon: Info },
  { href: "/#tentang", label: "Tentang Kami", icon: CircleHelp },
  { href: "/#top-muthawif", label: "Muthawif Pilihan", icon: Star },
  { href: "/#testimoni", label: "Testimoni", icon: ClipboardList },
  { href: "/register", label: "Bergabung", icon: Users },
] as const;

export function MobileBottomNav(): ReactElement {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSheetOpen]);

  const closeSheet = () => setIsSheetOpen(false);
  const toggleSheet = () => setIsSheetOpen((prev) => !prev);

  return (
    <>
      <nav
        aria-label="Navigasi mobile"
        className="fixed inset-x-5 bottom-[clamp(1rem,4vw,2rem)] z-[190] flex h-[72px] items-center justify-between rounded-xl border border-white/60 bg-white/85 px-2 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[20px] min-[900px]:hidden"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          if (item.href === "CENTER") {
            return (
              <div key={item.label} className="relative flex h-full w-[80px] items-center justify-center">
                <button
                  type="button"
                  aria-label="Fitur Utama"
                  onClick={toggleSheet}
                  className="absolute -top-6 flex size-16 items-center justify-center rounded-full border-4 border-[var(--ivory)] bg-gradient-to-br from-[var(--emerald)] to-[var(--emerald-light)] text-white shadow-[0_8px_24px_rgba(27,107,74,0.35)] transition-transform duration-200 active:scale-95"
                >
                  <item.icon className="size-[28px]" strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          const isActive = pathname === item.href || (pathname === "/" && item.href.startsWith("/#"));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSheet}
              className={cn(
                "flex h-full flex-1 flex-col items-center justify-center gap-1 text-[0.625rem] font-bold transition-all duration-200",
                isActive ? "text-[var(--emerald)]" : "text-gray-400"
              )}
            >
              <item.icon
                className="size-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(isActive && "text-[var(--charcoal)]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Sheet Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isSheetOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeSheet}
      />

      {/* Bottom Sheet Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu Fitur"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[220] rounded-t-2xl bg-white pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 px-6 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          isSheetOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-xl font-black text-[var(--charcoal)]">Menu Navigasi</h3>
          <button
            onClick={closeSheet}
            className="flex size-9 items-center justify-center rounded-full bg-[var(--ivory-dark)] text-[var(--text-muted)] transition-all duration-200 hover:bg-red-50 hover:text-[var(--error)]"
          >
            <X className="size-6" strokeWidth={2.5} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-x-2 gap-y-6">
          {BOTTOM_SHEET_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeSheet}
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex size-14 items-center justify-center rounded-xl border-[1.5px] border-[var(--border)] bg-[var(--ivory)] text-[var(--emerald)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--emerald)] group-hover:bg-[var(--emerald-pale)]">
                <item.icon className="size-5" />
              </div>
              <span className="text-center text-[0.6875rem] font-bold text-[var(--text-body)] transition-colors duration-200 group-hover:text-[var(--emerald)]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
