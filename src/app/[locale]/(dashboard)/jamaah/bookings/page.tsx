import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BookingStatus, UserRole } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getJamaahBookings, type JamaahBookingRow } from "@/lib/jamaah/data";
import { bookingStatusVariant, paymentStatusVariant } from "@/lib/jamaah/status";
import { bookingListQuerySchema } from "@/lib/validators/jamaah";

export const metadata: Metadata = { title: "Booking Saya" };

type BookingsPageProps = { readonly searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function JamaahBookingsPage({ searchParams }: BookingsPageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const query = bookingListQuerySchema.parse(await searchParams);
  const t = await getTranslations("Jamaah.bookings");
  const common = await getTranslations("Jamaah.common");
  const statusT = await getTranslations("Jamaah.status");
  const bookings = await getJamaahBookings(session.userId, query);
  const statuses = Object.values(BookingStatus);
  const previousHref = bookings.page > 1 ? paginationHref("/jamaah/bookings", await searchParams, bookings.page - 1) : undefined;
  const nextHref = bookings.page < bookings.pageCount ? paginationHref("/jamaah/bookings", await searchParams, bookings.page + 1) : undefined;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <DataListToolbar searchLabel={common("search")} searchPlaceholder={t("searchPlaceholder")} filterLabel={common("status")} sortLabel={common("sort")} actionLabel={common("apply")} filterName="status" filterOptions={[{ value: "", label: common("all") }, ...statuses.map((status) => ({ value: status, label: statusT(`booking.${status}`) }))]} sortOptions={[{ value: "latest", label: common("latest") }, { value: "schedule", label: common("schedule") }, { value: "price", label: common("price") }]} />
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {bookings.rows.length > 0 ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{common("service")}</th><th scope="col" className="px-5 py-4">{common("schedule")}</th><th scope="col" className="px-5 py-4">{common("price")}</th><th scope="col" className="px-5 py-4">{common("status")}</th><th scope="col" className="px-5 py-4">{common("action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{bookings.rows.map((booking) => <BookingTableRow key={booking.id} booking={booking} statusT={statusT} actionLabel={t("paymentAction")} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{bookings.rows.map((booking) => <BookingMobileCard key={booking.id} booking={booking} statusT={statusT} actionLabel={t("paymentAction")} />)}</div></> : <EmptyState title={t("empty.title")} description={t("empty.description")} />}
        <DataListPagination label={common("pageSummary", { page: bookings.page, pageCount: bookings.pageCount, total: bookings.total })} previousLabel={common("previous")} nextLabel={common("next")} previousHref={previousHref} nextHref={nextHref} />
      </section>
    </div>
  );
}

function paginationHref(pathname: string, params: Record<string, string | string[] | undefined>, page: number): string {
  const nextParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && typeof value === "string" && value) nextParams.set(key, value);
  }
  nextParams.set("page", String(page));
  return `${pathname}?${nextParams.toString()}`;
}

function BookingTableRow({ booking, statusT, actionLabel }: { readonly booking: JamaahBookingRow; readonly statusT: (key: string) => string; readonly actionLabel: string }): ReactElement {
  return <tr><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{booking.serviceTitle}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{booking.providerName}</p></td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{formatDate(booking.scheduledStart)}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{booking.totalPrice}</td><td className="px-5 py-4"><div className="flex flex-col items-start gap-2"><StatusBadge label={statusT(`booking.${booking.status}`)} variant={bookingStatusVariant(booking.status)} />{booking.paymentStatus ? <StatusBadge label={statusT(`payment.${booking.paymentStatus}`)} variant={paymentStatusVariant(booking.paymentStatus)} /> : null}</div></td><td className="px-5 py-4">{booking.paymentId ? <Link href={`/jamaah/payments/${booking.paymentId}`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{actionLabel}</Link> : null}</td></tr>;
}

function BookingMobileCard({ booking, statusT, actionLabel }: { readonly booking: JamaahBookingRow; readonly statusT: (key: string) => string; readonly actionLabel: string }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{formatDate(booking.scheduledStart)}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{booking.serviceTitle}</h2></div><StatusBadge label={statusT(`booking.${booking.status}`)} variant={bookingStatusVariant(booking.status)} /></div><p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{booking.providerName}</p><div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-[var(--text-muted)]">{booking.totalPrice}</p>{booking.paymentStatus ? <p className="mt-1 text-xs font-extrabold text-[var(--gold)]">{statusT(`payment.${booking.paymentStatus}`)}</p> : null}</div>{booking.paymentId ? <Link href={`/jamaah/payments/${booking.paymentId}`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--charcoal)]">{actionLabel}</Link> : null}</div></article>;
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement {
  return <div className="grid min-h-56 place-items-center p-5 text-center"><div className="max-w-sm"><CalendarDays className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
