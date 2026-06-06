"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  Settings,
  Users,
  CarFront,
  FileText,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

const ROLE_NAV_ITEMS = {
  jamaah: [
    { label: "Overview", href: "/jamaah", icon: LayoutDashboard },
    { label: "Booking Saya", href: "/jamaah/bookings", icon: CalendarDays },
    { label: "Pembayaran", href: "/jamaah/payments", icon: CreditCard },
    { label: "Pengaturan", href: "/jamaah/settings", icon: Settings },
  ],
  muthawif: [
    { label: "Overview", href: "/muthawif", icon: LayoutDashboard },
    { label: "Jadwal Saya", href: "/muthawif/schedule", icon: CalendarDays },
    { label: "Pendapatan", href: "/muthawif/earnings", icon: CreditCard },
    { label: "Pengaturan", href: "/muthawif/settings", icon: Settings },
  ],
  provider: [
    { label: "Overview", href: "/provider", icon: LayoutDashboard },
    { label: "Manajemen Staf", href: "/provider/staff", icon: Users },
    { label: "Armada", href: "/provider/fleet", icon: CarFront },
    { label: "Pendapatan", href: "/provider/earnings", icon: CreditCard },
    { label: "Pengaturan", href: "/provider/settings", icon: Settings },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Verifikasi", href: "/admin/verifications", icon: ShieldCheck },
    { label: "Escrow", href: "/admin/escrow", icon: CreditCard },
    { label: "Pengguna", href: "/admin/users", icon: Users },
    { label: "Laporan", href: "/admin/reports", icon: FileText },
  ],
};

type Role = keyof typeof ROLE_NAV_ITEMS;

export function DashboardSidebar() {
  const pathname = usePathname();
  
  // Determine role from pathname to show correct links
  // E.g., /jamaah/settings -> jamaah
  const currentRole = (Object.keys(ROLE_NAV_ITEMS).find(role => pathname.startsWith(`/${role}`)) || "jamaah") as Role;
  
  const navItems = ROLE_NAV_ITEMS[currentRole];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--ivory)] max-md:hidden">
      <div className="flex h-16 shrink-0 items-center px-6">
        <BrandMark />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="mb-2 px-2 text-xs font-extrabold tracking-[0.1em] text-[var(--gold)] uppercase">
          Menu Utama
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
                  isActive
                    ? "bg-[var(--emerald)]/10 text-[var(--emerald)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--emerald-pale)] hover:text-[var(--emerald)]"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive ? "text-[var(--emerald)]" : "text-gray-400 group-hover:text-[var(--emerald)]"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <Link
          href="/"
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50"
        >
          <LogOut className="size-5 shrink-0" />
          Keluar
        </Link>
      </div>
    </aside>
  );
}
