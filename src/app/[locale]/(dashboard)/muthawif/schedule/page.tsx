import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CalendarDays } from "lucide-react";
import { UserRole as PrismaUserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { bookingStatusVariant, paymentStatusVariant } from "@/lib/jamaah/status";
import { getPartnerBookings, type PartnerBookingRow } from "@/lib/partner/data";

export const metadata: Metadata = { title: "Jadwal Muthawif" };

export default async function MuthawifSchedulePage(): Promise<ReactElement> {
  const session = await requireRoleSession([PrismaUserRole.MUTHAWIF]);
  const [t, common, statusT, rows] = await Promise.all([
    getTranslations("Partner.muthawif.schedule"),
    getTranslations("Partner.common"),
    getTranslations("Jamaah.status"),
    getPartnerBookings(session.userId),
  ]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <DataListToolbar searchLabel={common("search")} searchPlaceholder={t("searchPlaceholder")} filterLabel={common("status")} sortLabel={common("sort")} actionLabel={common("apply")} filterName="status" filterOptions={[{ value: "", label: common("all") }, { value: "CONFIRMED", label: statusT("booking.CONFIRMED") }, { value: "IN_PROGRESS", label: statusT("booking.IN_PROGRESS") }, { value: "COMPLETED", label: statusT("booking.COMPLETED") }]} sortOptions={[{ value: "latest", label: common("latest") }, { value: "schedule", label: common("schedule") }]} />
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {rows.length > 0 ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{common("service")}</th><th scope="col" className="px-5 py-4">{common("customer")}</th><th scope="col" className="px-5 py-4">{common("schedule")}</th><th scope="col" className="px-5 py-4">{common("amount")}</th><th scope="col" className="px-5 py-4">{common("status")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rows.map((row) => <BookingTableRow key={row.id} row={row} statusT={statusT} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{rows.map((row) => <BookingMobileCard key={row.id} row={row} statusT={statusT} />)}</div></> : <EmptyState title={t("empty.title")} description={t("empty.description")} />}
        <DataListPagination label={common("pageSummary", { total: rows.length })} previousLabel={common("previous")} nextLabel={common("next")} />
      </section>
    </div>
  );
}

function BookingTableRow({ row, statusT }: { readonly row: PartnerBookingRow; readonly statusT: (key: string) => string }): ReactElement {
  return <tr><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.serviceTitle}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.customerName}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{formatDate(row.scheduledStart)}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.amount}</td><td className="px-5 py-4"><div className="flex flex-col items-start gap-2"><StatusBadge label={statusT(`booking.${row.status}`)} variant={bookingStatusVariant(row.status)} />{row.paymentStatus ? <StatusBadge label={statusT(`payment.${row.paymentStatus}`)} variant={paymentStatusVariant(row.paymentStatus)} /> : null}</div></td></tr>;
}

function BookingMobileCard({ row, statusT }: { readonly row: PartnerBookingRow; readonly statusT: (key: string) => string }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{formatDate(row.scheduledStart)}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{row.serviceTitle}</h2></div><StatusBadge label={statusT(`booking.${row.status}`)} variant={bookingStatusVariant(row.status)} /></div><p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{row.customerName}</p><p className="mt-4 font-extrabold text-[var(--charcoal)]">{row.amount}</p></article>;
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement {
  return <div className="grid min-h-56 place-items-center p-5 text-center"><div className="max-w-sm"><CalendarDays className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
