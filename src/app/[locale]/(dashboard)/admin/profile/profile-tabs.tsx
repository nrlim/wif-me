"use client";

import type { ReactElement } from "react";
import { usePathname, Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function ProfileTabs(): ReactElement {
  const pathname = usePathname();

  const tabs = [
    { name: "General Profile", href: "/admin/profile" },
    { name: "Keamanan & Password", href: "/admin/profile/security" },
  ];

  return (
    <div className="border-b border-[var(--border)]">
      <nav className="-mb-px flex gap-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-extrabold transition-colors",
                isActive
                  ? "border-[var(--emerald)] text-[var(--emerald)]"
                  : "border-transparent text-[var(--text-muted)] hover:border-[var(--emerald-pale)] hover:text-[var(--emerald)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
