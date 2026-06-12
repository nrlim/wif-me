"use client";

import type { ReactElement } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

type ProfileTab = {
  readonly name: string;
  readonly href: string;
};

type ProfileTabsProps = {
  readonly tabs: readonly ProfileTab[];
};

export function ProfileTabs({ tabs }: ProfileTabsProps): ReactElement {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto border-b border-[var(--border)]">
      <nav className="flex min-w-max gap-5" aria-label="Profile tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className={cn("whitespace-nowrap border-b-2 px-1 py-4 text-sm font-extrabold transition-colors", isActive ? "border-[var(--emerald)] text-[var(--emerald)]" : "border-transparent text-[var(--text-muted)] hover:border-[var(--emerald-pale)] hover:text-[var(--emerald)]")} aria-current={isActive ? "page" : undefined}>
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
