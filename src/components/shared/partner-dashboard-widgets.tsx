import type { ReactElement } from "react";
import { CalendarDays, CreditCard, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "@/i18n/routing";
import { StatusBadge } from "@/components/shared/status-badge";
import { bookingStatusVariant, paymentStatusVariant } from "@/lib/jamaah/status";
import type { PartnerBookingRow, PartnerEarningRow, PartnerServiceRow } from "@/lib/partner/data";

type MetricText = {
  readonly verification: string;
  readonly services: string;
  readonly activeBookings: string;
  readonly escrow: string;
};

type BookingText = {
  readonly title: string;
  readonly empty: string;
  readonly customer: string;
  readonly detail: string;
  readonly bookingStatus: (status: string) => string;
  readonly paymentStatus: (status: string) => string;
};

export function PartnerMetrics({ text, verificationLabel, serviceCount, activeBookings, escrowAmount }: { readonly text: MetricText; readonly verificationLabel: string; readonly serviceCount: number; readonly activeBookings: number; readonly escrowAmount: string }): ReactElement {
  return (
    <section className="hidden rounded-xl border border-[var(--border)] bg-white md:grid md:grid-cols-4 md:divide-x md:divide-[var(--border)]">
      <Metric icon={<ShieldCheck className="size-5" aria-hidden="true" />} label={text.verification} value={verificationLabel} />
      <Metric icon={<WalletCards className="size-5" aria-hidden="true" />} label={text.services} value={String(serviceCount)} />
      <Metric icon={<CalendarDays className="size-5" aria-hidden="true" />} label={text.activeBookings} value={String(activeBookings)} />
      <Metric icon={<CreditCard className="size-5" aria-hidden="true" />} label={text.escrow} value={escrowAmount} />
    </section>
  );
}

export function PartnerUpcomingBookings({ rows, text, detailHref }: { readonly rows: readonly PartnerBookingRow[]; readonly text: BookingText; readonly detailHref: string }): ReactElement {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
      <div className="border-b border-[var(--border)] px-4 py-4 md:px-5"><h2 className="text-base font-extrabold text-[var(--charcoal)]">{text.title}</h2></div>
      <div className="grid gap-3 p-3 md:p-5">
        {rows.length > 0 ? rows.map((row) => <PartnerBookingCard key={row.id} row={row} text={text} detailHref={detailHref} />) : <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--ivory)] p-5 text-sm font-bold leading-6 text-[var(--text-muted)]">{text.empty}</p>}
      </div>
    </section>
  );
}

export function PartnerServicesList({ rows, emptyLabel, bookingLabel, statusLabel }: { readonly rows: readonly PartnerServiceRow[]; readonly emptyLabel: string; readonly bookingLabel: string; readonly statusLabel: (active: boolean) => string }): ReactElement {
  return <div className="grid gap-3 p-3 md:hidden">{rows.length > 0 ? rows.map((row) => <article key={row.id} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{row.routeLabel ?? row.type}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{row.title}</h2></div><StatusBadge label={statusLabel(row.isActive)} variant={row.isActive ? "success" : "warning"} /></div><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{row.description}</p><div className="mt-4 flex items-end justify-between gap-3"><div><p className="font-extrabold text-[var(--charcoal)]">{row.basePrice}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{bookingLabel}: {row.bookingCount}</p></div></div></article>) : <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--ivory)] p-5 text-sm font-bold text-[var(--text-muted)]">{emptyLabel}</p>}</div>;
}

export function PartnerEarningsList({ rows, emptyLabel, statusLabel, detailLabel }: { readonly rows: readonly PartnerEarningRow[]; readonly emptyLabel: string; readonly statusLabel: (status: string) => string; readonly detailLabel: string }): ReactElement {
  return <div className="grid gap-3 p-3 md:hidden">{rows.length > 0 ? rows.map((row) => <article key={row.id} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{row.reference}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{row.serviceTitle}</h2></div><StatusBadge label={statusLabel(row.status)} variant={paymentStatusVariant(row.status)} /></div><p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{row.customerName}</p><div className="mt-4 flex items-end justify-between gap-3"><p className="font-extrabold text-[var(--charcoal)]">{row.amount}</p><p className="text-xs font-bold text-[var(--text-muted)]">{detailLabel}</p></div></article>) : <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--ivory)] p-5 text-sm font-bold text-[var(--text-muted)]">{emptyLabel}</p>}</div>;
}

function PartnerBookingCard({ row, text, detailHref }: { readonly row: PartnerBookingRow; readonly text: BookingText; readonly detailHref: string }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:gap-4"><div className="flex items-start gap-3"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald-pale)] text-[var(--emerald)]"><CalendarDays className="size-5" aria-hidden="true" /></div><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{formatDate(row.scheduledStart)}</p><h3 className="mt-1 font-extrabold text-[var(--charcoal)]">{row.serviceTitle}</h3><p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">{text.customer}: {row.customerName}</p></div></div><div className="mt-4 flex items-end justify-between gap-3 md:mt-0 md:flex-col md:items-end"><div className="flex flex-wrap justify-end gap-2"><StatusBadge label={text.bookingStatus(row.status)} variant={bookingStatusVariant(row.status)} />{row.paymentStatus ? <StatusBadge label={text.paymentStatus(row.paymentStatus)} variant={paymentStatusVariant(row.paymentStatus)} /> : null}</div><Link href={detailHref} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-extrabold text-[var(--charcoal)]">{text.detail}</Link></div></article>;
}

function Metric({ icon, label, value }: { readonly icon: ReactElement; readonly label: string; readonly value: string }): ReactElement {
  return <div className="flex items-center gap-4 p-5"><span className="flex size-11 items-center justify-center rounded-xl bg-[var(--emerald-pale)] text-[var(--emerald)]">{icon}</span><div><p className="text-sm font-bold text-[var(--text-muted)]">{label}</p><p className="text-xl font-black text-[var(--charcoal)]">{value}</p></div></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
