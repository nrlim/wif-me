"use client";

import { useState, useSyncExternalStore, type ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { useSidebarStore } from "@/hooks/use-sidebar-store";

import { ROLE_NAV_ITEMS, type NavigationItem } from "@/lib/constants/navigation";

type Role = keyof typeof ROLE_NAV_ITEMS;

function subscribeToHydration(): () => void {
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

export function DashboardSidebar(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.nav");
  const currentRole = (Object.keys(ROLE_NAV_ITEMS).find((role) => pathname.startsWith(`/${role}`)) || "jamaah") as Role;
  const navItems: readonly NavigationItem[] = ROLE_NAV_ITEMS[currentRole];
  const [expandedItems, setExpandedItems] = useState<ReadonlySet<string>>(() => new Set(navItems.filter((item) => pathname.startsWith(item.href) || item.children?.some((child) => pathname.startsWith(child.href))).map((item) => item.href)));

  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const mounted = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const isActuallyCollapsed = mounted && isCollapsed;

  const toggleExpanded = (href: string): void => {
    // If collapsed, don't allow expanding submenus (or we auto expand sidebar first)
    if (isActuallyCollapsed) {
      toggleSidebar();
    }
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-white max-md:hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]", isActuallyCollapsed ? "w-20" : "w-64")}>
      <div className={cn("flex h-16 shrink-0 items-center justify-between px-6", isActuallyCollapsed && "px-4 justify-center")}>
        <div className={cn("overflow-hidden transition-all duration-300", isActuallyCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <BrandMark />
        </div>
        <button type="button" onClick={toggleSidebar} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--emerald-pale)] hover:text-[var(--emerald)] transition-colors" aria-label={isActuallyCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={isActuallyCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {isActuallyCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>
      <div className={cn("flex flex-1 flex-col overflow-y-auto py-4", isActuallyCollapsed ? "px-2" : "px-4")}>
        <div className={cn("mb-2 px-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--gold)] transition-all", isActuallyCollapsed && "sr-only")}>{t("mainMenu")}</div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => <SidebarItem key={item.href} item={item} pathname={pathname} isExpanded={expandedItems.has(item.href) && !isActuallyCollapsed} onToggle={toggleExpanded} isCollapsed={isActuallyCollapsed} />)}
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem({ item, pathname, isExpanded, onToggle, isCollapsed }: { readonly item: NavigationItem; readonly pathname: string; readonly isExpanded: boolean; readonly onToggle: (href: string) => void; readonly isCollapsed: boolean }): ReactElement {
  const t = useTranslations("Dashboard.nav");
  const hasChildren = Boolean(item.children?.length);
  const isActive = hasChildren && item.children ? item.children.some((child) => pathname.startsWith(child.href)) : item.href === "/admin" || item.href === "/jamaah" || item.href === "/muthawif" || item.href === "/provider" ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  if (!hasChildren) {
    return <SidebarLink href={item.href} icon={Icon} label={t(item.labelKey)} isActive={isActive} isCollapsed={isCollapsed} />;
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={() => onToggle(item.href)} aria-expanded={isExpanded} className={cn("group flex min-h-11 items-center gap-3 rounded-xl py-2.5 text-left text-sm font-bold transition-all overflow-hidden", isCollapsed ? "px-0 justify-center w-full" : "px-3", isActive ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "text-[var(--text-muted)] hover:bg-[var(--emerald-pale)] hover:text-[var(--emerald)]")} title={isCollapsed ? t(item.labelKey) : undefined}>
        <Icon className={cn("size-5 shrink-0", isActive ? "text-[var(--emerald)]" : "text-gray-400 group-hover:text-[var(--emerald)]")} strokeWidth={isActive ? 2.5 : 2} />
        <span className={cn("min-w-0 flex-1 truncate transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>{t(item.labelKey)}</span>
        {!isCollapsed && <ChevronDown className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-180")} aria-hidden="true" />}
      </button>
      {isExpanded ? (
        <div className="ml-5 flex flex-col gap-1 border-l border-[var(--border)] pl-3">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return <SidebarLink key={child.href} href={child.href} icon={ChildIcon} label={t(child.labelKey)} isActive={pathname.startsWith(child.href)} isChild isCollapsed={isCollapsed} />;
          })}
        </div>
      ) : null}
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label, isActive, isChild = false, isCollapsed = false }: { readonly href: string; readonly icon: LucideIcon; readonly label: string; readonly isActive: boolean; readonly isChild?: boolean; readonly isCollapsed?: boolean }): ReactElement {
  return (
    <Link href={href} className={cn("group flex min-h-11 items-center gap-3 rounded-xl py-2.5 text-sm font-bold transition-all overflow-hidden", isChild ? "rounded-lg text-[0.8125rem]" : "", isCollapsed ? "px-0 justify-center w-full" : "px-3", isActive ? "bg-[var(--emerald)]/10 text-[var(--emerald)]" : "text-[var(--text-muted)] hover:bg-[var(--emerald-pale)] hover:text-[var(--emerald)]")} title={isCollapsed ? label : undefined}>
      <Icon className={cn("size-5 shrink-0", isChild && !isCollapsed && "size-4", isActive ? "text-[var(--emerald)]" : "text-gray-400 group-hover:text-[var(--emerald)]")} strokeWidth={isActive ? 2.5 : 2} />
      <span className={cn("truncate transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>{label}</span>
    </Link>
  );
}
