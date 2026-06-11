"use client";

import { useState, type ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

import { ROLE_NAV_ITEMS, type NavigationItem } from "@/lib/constants/navigation";

type Role = keyof typeof ROLE_NAV_ITEMS;

export function DashboardSidebar(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.nav");
  const currentRole = (Object.keys(ROLE_NAV_ITEMS).find((role) => pathname.startsWith(`/${role}`)) || "jamaah") as Role;
  const navItems: readonly NavigationItem[] = ROLE_NAV_ITEMS[currentRole];
  const [expandedItems, setExpandedItems] = useState<ReadonlySet<string>>(() => new Set(navItems.filter((item) => pathname.startsWith(item.href) || item.children?.some((child) => pathname.startsWith(child.href))).map((item) => item.href)));

  const toggleExpanded = (href: string): void => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-white max-md:hidden">
      <div className="flex h-16 shrink-0 items-center px-6">
        <BrandMark />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="mb-2 px-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--gold)]">{t("mainMenu")}</div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => <SidebarItem key={item.href} item={item} pathname={pathname} isExpanded={expandedItems.has(item.href)} onToggle={toggleExpanded} />)}
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem({ item, pathname, isExpanded, onToggle }: { readonly item: NavigationItem; readonly pathname: string; readonly isExpanded: boolean; readonly onToggle: (href: string) => void }): ReactElement {
  const t = useTranslations("Dashboard.nav");
  const hasChildren = Boolean(item.children?.length);
  const isActive = hasChildren && item.children ? item.children.some((child) => pathname.startsWith(child.href)) : item.href === "/admin" || item.href === "/jamaah" || item.href === "/muthawif" || item.href === "/provider" ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  if (!hasChildren) {
    return <SidebarLink href={item.href} icon={Icon} label={t(item.labelKey)} isActive={isActive} />;
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={() => onToggle(item.href)} aria-expanded={isExpanded} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all", isActive ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "text-[var(--text-muted)] hover:bg-[var(--emerald-pale)] hover:text-[var(--emerald)]")}>
        <Icon className={cn("size-5 shrink-0", isActive ? "text-[var(--emerald)]" : "text-gray-400 group-hover:text-[var(--emerald)]")} strokeWidth={isActive ? 2.5 : 2} />
        <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-180")} aria-hidden="true" />
      </button>
      {isExpanded ? (
        <div className="ml-5 flex flex-col gap-1 border-l border-[var(--border)] pl-3">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return <SidebarLink key={child.href} href={child.href} icon={ChildIcon} label={t(child.labelKey)} isActive={pathname.startsWith(child.href)} isChild />;
          })}
        </div>
      ) : null}
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label, isActive, isChild = false }: { readonly href: string; readonly icon: LucideIcon; readonly label: string; readonly isActive: boolean; readonly isChild?: boolean }): ReactElement {
  return (
    <Link href={href} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all", isChild && "rounded-lg text-[0.8125rem]", isActive ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "text-[var(--text-muted)] hover:bg-[var(--emerald-pale)] hover:text-[var(--emerald)]")}>
      <Icon className={cn("size-5 shrink-0", isChild && "size-4", isActive ? "text-[var(--emerald)]" : "text-gray-400 group-hover:text-[var(--emerald)]")} strokeWidth={isActive ? 2.5 : 2} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
