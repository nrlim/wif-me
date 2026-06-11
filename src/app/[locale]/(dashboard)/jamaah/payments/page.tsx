import type { Metadata } from "next";
import type { ReactElement } from "react";
import { CreditCard } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PaymentStatus, UserRole } from "@prisma/client";
import { Link } from "@/i18n/routing";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DataListToolbar } from "@/components/shared/data-list-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getJamaahPayments, type JamaahPaymentRow } from "@/lib/jamaah/data";
import { paymentStatusVariant } from "@/lib/jamaah/status";
import { paymentListQuerySchema } from "@/lib/validators/jamaah";

export const metadata: Metadata = { title: "Pembayaran" };

type PaymentsPageProps = { readonly searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function JamaahPaymentsPage({ searchParams }: PaymentsPageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.JAMAAH]);
  const query = paymentListQuerySchema.parse(await searchParams);
  const t = await getTranslations("Jamaah.payments");
  const common = await getTranslations("Jamaah.common");
  const statusT = await getTranslations("Jamaah.status");
  const payments = await getJamaahPayments(session.userId, query);
  const statuses = Object.values(PaymentStatus);
  const previousHref = payments.page > 1 ? paginationHref("/jamaah/payments", await searchParams, payments.page - 1) : undefined;
  const nextHref = payments.page < payments.pageCount ? paginationHref("/jamaah/payments", await searchParams, payments.page + 1) : undefined;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <DataListToolbar searchLabel={common("search")} searchPlaceholder={t("searchPlaceholder")} filterLabel={common("status")} sortLabel={common("sort")} actionLabel={common("apply")} filterName="status" filterOptions={[{ value: "", label: common("all") }, ...statuses.map((status) => ({ value: status, label: statusT(`payment.${status}`) }))]} sortOptions={[{ value: "latest", label: common("latest") }, { value: "amount", label: common("price") }]} />
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {payments.rows.length > 0 ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th scope="col" className="px-5 py-4">{common("service")}</th><th scope="col" className="px-5 py-4">{common("reference")}</th><th scope="col" className="px-5 py-4">{common("price")}</th><th scope="col" className="px-5 py-4">{common("status")}</th><th scope="col" className="px-5 py-4">{common("action")}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{payments.rows.map((payment) => <PaymentTableRow key={payment.id} payment={payment} statusT={statusT} actionLabel={t("detailAction")} />)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{payments.rows.map((payment) => <PaymentMobileCard key={payment.id} payment={payment} statusT={statusT} actionLabel={t("detailAction")} />)}</div></> : <EmptyState title={t("empty.title")} description={t("empty.description")} />}
        <DataListPagination label={common("pageSummary", { page: payments.page, pageCount: payments.pageCount, total: payments.total })} previousLabel={common("previous")} nextLabel={common("next")} previousHref={previousHref} nextHref={nextHref} />
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

function PaymentTableRow({ payment, statusT, actionLabel }: { readonly payment: JamaahPaymentRow; readonly statusT: (key: string) => string; readonly actionLabel: string }): ReactElement {
  return <tr><td className="px-5 py-4"><p className="font-extrabold text-[var(--charcoal)]">{payment.serviceTitle}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{formatDate(payment.createdAt)}</p></td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{payment.reference}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{payment.amount}</td><td className="px-5 py-4"><StatusBadge label={statusT(`payment.${payment.status}`)} variant={paymentStatusVariant(payment.status)} /></td><td className="px-5 py-4"><Link href={`/jamaah/payments/${payment.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">{actionLabel}</Link></td></tr>;
}

function PaymentMobileCard({ payment, statusT, actionLabel }: { readonly payment: JamaahPaymentRow; readonly statusT: (key: string) => string; readonly actionLabel: string }): ReactElement {
  return <article className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--text-muted)]">{payment.reference}</p><h2 className="mt-1 font-extrabold text-[var(--charcoal)]">{payment.serviceTitle}</h2></div><StatusBadge label={statusT(`payment.${payment.status}`)} variant={paymentStatusVariant(payment.status)} /></div><div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-[var(--text-muted)]">{formatDate(payment.createdAt)}</p><p className="mt-1 font-extrabold text-[var(--charcoal)]">{payment.amount}</p></div><Link href={`/jamaah/payments/${payment.id}`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-extrabold text-[var(--charcoal)]">{actionLabel}</Link></div></article>;
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement {
  return <div className="grid min-h-56 place-items-center p-5 text-center"><div className="max-w-sm"><CreditCard className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
