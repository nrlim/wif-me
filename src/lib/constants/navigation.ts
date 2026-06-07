import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  Percent,
  ReceiptText,
  Settings,
  UserCheck,
  Users,
  WalletCards,
  type LucideIcon
} from "lucide-react";

export type NavigationItem = {
  readonly labelKey: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly children?: readonly NavigationItem[];
};

export const ROLE_NAV_ITEMS: Record<string, readonly NavigationItem[]> = {
  jamaah: [
    { labelKey: "roles.jamaah.overview", href: "/jamaah", icon: LayoutDashboard },
    { labelKey: "roles.jamaah.bookings", href: "/jamaah/bookings", icon: CalendarDays },
    { labelKey: "roles.jamaah.payments", href: "/jamaah/payments", icon: CreditCard },
    { labelKey: "roles.jamaah.settings", href: "/jamaah/settings", icon: Settings },
  ],
  muthawif: [
    { labelKey: "roles.muthawif.overview", href: "/muthawif", icon: LayoutDashboard },
    { labelKey: "roles.muthawif.schedule", href: "/muthawif/schedule", icon: CalendarDays },
    { labelKey: "roles.muthawif.earnings", href: "/muthawif/earnings", icon: CreditCard },
    { labelKey: "roles.muthawif.settings", href: "/muthawif/settings", icon: Settings },
  ],
  provider: [
    { labelKey: "roles.provider.overview", href: "/provider", icon: LayoutDashboard },
    { labelKey: "roles.provider.staff", href: "/provider/staff", icon: Users },
    { labelKey: "roles.provider.fleet", href: "/provider/fleet", icon: CarFront },
    { labelKey: "roles.provider.earnings", href: "/provider/earnings", icon: CreditCard },
    { labelKey: "roles.provider.settings", href: "/provider/settings", icon: Settings },
  ],
  admin: [
    { labelKey: "roles.admin.overview", href: "/admin", icon: LayoutDashboard },
    {
      labelKey: "roles.admin.services",
      href: "/admin/services",
      icon: BriefcaseBusiness,
      children: [
        { labelKey: "roles.admin.serviceCategories", href: "/admin/services/categories", icon: FolderTree },
        { labelKey: "roles.admin.serviceItems", href: "/admin/services/items", icon: ListChecks },
      ],
    },
    {
      labelKey: "roles.admin.partners",
      href: "/admin/partners",
      icon: Users,
      children: [
        { labelKey: "roles.admin.muthawif", href: "/admin/partners/muthawif", icon: UserCheck },
        { labelKey: "roles.admin.providers", href: "/admin/partners/providers", icon: Building2 },
      ],
    },
    { labelKey: "roles.admin.transactions", href: "/admin/transactions", icon: ReceiptText },
    {
      labelKey: "roles.admin.escrow",
      href: "/admin/escrow",
      icon: CreditCard,
      children: [
        { labelKey: "roles.admin.escrowHolding", href: "/admin/escrow/holding", icon: WalletCards },
        { labelKey: "roles.admin.withdrawals", href: "/admin/escrow/withdrawals", icon: CreditCard },
      ],
    },
    {
      labelKey: "roles.admin.financeSettings",
      href: "/admin/fees",
      icon: Percent,
      children: [
        { labelKey: "roles.admin.fees", href: "/admin/fees", icon: Percent },
        { labelKey: "roles.admin.charges", href: "/admin/charges", icon: WalletCards },
      ],
    },
  ],
};
