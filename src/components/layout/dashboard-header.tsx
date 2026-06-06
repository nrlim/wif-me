"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();
  const currentRole = Object.keys({ jamaah: 1, muthawif: 1, provider: 1, admin: 1 }).find(role => pathname.startsWith(`/${role}`)) || "jamaah";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-white/80 px-4 shadow-sm backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 md:hidden">
        <span className="sr-only">Open sidebar</span>
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Cari..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <span className="sr-only">View notifications</span>
            <Bell className="size-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          <div className="flex items-center gap-x-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--emerald-light)] text-xs font-bold text-white shadow-sm">
              {currentRole.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-bold leading-6 text-gray-900 lg:block">
              {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
