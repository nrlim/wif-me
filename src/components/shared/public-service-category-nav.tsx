"use client";

import type { ComponentType, ReactElement } from "react";
import { CarFront, FileCheck2, Plus, UserCheck, type LucideProps } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/hooks/use-cart-store";

type PublicServiceCategoryNavItem = {
  readonly key: string;
  readonly slug: string;
  readonly label: string;
  readonly count: number;
};

type PublicServiceCategoryNavProps = {
  readonly items: readonly PublicServiceCategoryNavItem[];
  readonly ariaLabel: string;
  readonly activeSlug?: string;
  readonly asSidebar?: boolean;
  readonly basePath?: string;
};

const CATEGORY_ICONS: Record<string, ComponentType<LucideProps>> = {
  muthawifPersonal: UserCheck,
  transportation: CarFront,
  visaProcessing: FileCheck2,
  additionalServices: Plus,
};

export function PublicServiceCategoryNav({ items, ariaLabel, activeSlug, asSidebar, basePath = "/services" }: PublicServiceCategoryNavProps): ReactElement {
  const primaryLocationId = useCartStore((state) => state.getPrimaryLocationId());

  return (
    <nav aria-label={ariaLabel} className={cn("-mx-4 px-4 sm:mx-0 sm:px-0", asSidebar && "lg:w-full")}>
      <div className={cn(
        "flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:pb-0",
        asSidebar ? "lg:flex-col lg:gap-1.5 lg:overflow-visible" : "sm:flex-wrap sm:overflow-visible"
      )}>
        {items.map((item) => {
          const Icon = CATEGORY_ICONS[item.key] ?? Plus;
          const isActive = item.slug === activeSlug;
          const href = primaryLocationId ? `${basePath}/${item.slug}?loc=${primaryLocationId}` : `${basePath}/${item.slug}`;
          return (
            <Link
              key={item.slug}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors",
                asSidebar && "lg:justify-between lg:min-h-11",
                isActive
                  ? "border-[var(--emerald)] bg-[var(--emerald)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--emerald)]/40 hover:text-[var(--emerald)]"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </div>
              <span className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold", 
                isActive ? "bg-white/20 text-white" : "bg-[var(--ivory)] text-[var(--text-muted)]"
              )}>{item.count}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
