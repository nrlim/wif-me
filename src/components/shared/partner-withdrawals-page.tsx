import type { ReactElement } from "react";
import { CreditCard, WalletCards } from "lucide-react";
import type { WithdrawalStatus } from "@prisma/client";
import { DataListPagination } from "@/components/shared/data-list-pagination";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { createWithdrawalRequestAction } from "@/app/[locale]/(dashboard)/withdrawal-actions";
import type { PartnerWithdrawalRow, PartnerWithdrawalSummary } from "@/lib/partner/withdrawals";

type Text = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly available: string;
  readonly released: string;
  readonly inReview: string;
  readonly paid: string;
  readonly formTitle: string;
  readonly formDescription: string;
  readonly amount: string;
  readonly bankName: string;
  readonly accountName: string;
  readonly accountNumber: string;
  readonly note: string;
  readonly submit: string;
  readonly history: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly requestedNotice: string;
  readonly invalidNotice: string;
  readonly insufficientNotice: string;
  readonly statuses: Record<WithdrawalStatus, string>;
  readonly columns: { readonly reference: string; readonly bank: string; readonly amount: string; readonly status: string };
  readonly page: string;
  readonly previous: string;
  readonly next: string;
};

type PartnerWithdrawalsPageProps = {
  readonly locale: string;
  readonly notice?: string;
  readonly summary: PartnerWithdrawalSummary;
  readonly rows: readonly PartnerWithdrawalRow[];
  readonly text: Text;
};

export function PartnerWithdrawalsPage({ locale, notice, summary, rows, text }: PartnerWithdrawalsPageProps): ReactElement {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} />
      <Notice notice={notice} text={text} />
      <section className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-white md:block"><div className="grid divide-y divide-[var(--border)] md:grid-cols-4 md:divide-x md:divide-y-0"><Metric label={text.available} value={summary.available} /><Metric label={text.released} value={summary.released} /><Metric label={text.inReview} value={summary.inReview} /><Metric label={text.paid} value={summary.paid} /></div></section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] p-5"><h2 className="font-extrabold text-[var(--charcoal)]">{text.history}</h2></div>
          {rows.length > 0 ? <WithdrawalList rows={rows} text={text} /> : <EmptyState title={text.emptyTitle} description={text.emptyDescription} />}
          <DataListPagination label={text.page} previousLabel={text.previous} nextLabel={text.next} />
        </div>
        <form action={createWithdrawalRequestAction} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 lg:sticky lg:top-24">
          <input type="hidden" name="locale" value={locale} />
          <div className="mb-4 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]"><WalletCards className="size-5" aria-hidden="true" /></span><div><h2 className="font-extrabold text-[var(--charcoal)]">{text.formTitle}</h2><p className="text-xs font-bold leading-5 text-[var(--text-muted)]">{text.formDescription}</p></div></div>
          <div className="grid gap-3">
            <Field label={text.amount} name="amountIdr" type="number" min="100000" max={String(summary.availableIdr)} required />
            <Field label={text.bankName} name="bankName" required />
            <Field label={text.accountName} name="bankAccountName" required />
            <Field label={text.accountNumber} name="bankAccountNumber" inputMode="numeric" required />
            <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="requestedNote">{text.note}<textarea id="requestedNote" name="requestedNote" className="min-h-24 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" maxLength={500} /></label>
            <button type="submit" disabled={summary.availableIdr < 100000} className="min-h-11 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white disabled:opacity-50">{text.submit}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function WithdrawalList({ rows, text }: { readonly rows: readonly PartnerWithdrawalRow[]; readonly text: Text }): ReactElement {
  return <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-[var(--ivory)] text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]"><tr><th className="px-5 py-4">{text.columns.reference}</th><th className="px-5 py-4">{text.columns.bank}</th><th className="px-5 py-4">{text.columns.amount}</th><th className="px-5 py-4">{text.columns.status}</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{rows.map((row) => <tr key={row.id}><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.id.slice(0, 8)}</td><td className="px-5 py-4 font-bold text-[var(--text-muted)]">{row.bankName} · {row.accountLast4}</td><td className="px-5 py-4 font-extrabold text-[var(--charcoal)]">{row.amount}</td><td className="px-5 py-4"><Status label={text.statuses[row.status]} status={row.status} /></td></tr>)}</tbody></table></div><div className="grid gap-3 p-3 md:hidden">{rows.map((row) => <article key={row.id} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><p className="text-xs font-extrabold text-[var(--gold)]">{row.id.slice(0, 8)}</p><Status label={text.statuses[row.status]} status={row.status} /></div><p className="mt-3 font-extrabold text-[var(--charcoal)]">{row.amount}</p><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{row.bankName} · {row.accountLast4}</p></article>)}</div></>;
}

function Metric({ label, value }: { readonly label: string; readonly value: string }): ReactElement { return <div className="flex items-center gap-4 p-5"><CreditCard className="size-6 text-[var(--emerald)]" aria-hidden="true" /><div><p className="text-sm font-bold text-[var(--text-muted)]">{label}</p><p className="text-xl font-black text-[var(--charcoal)]">{value}</p></div></div>; }
function Field({ label, name, type = "text", min, max, inputMode, required }: { readonly label: string; readonly name: string; readonly type?: string; readonly min?: string; readonly max?: string; readonly inputMode?: "numeric"; readonly required?: boolean }): ReactElement { return <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor={name}>{label}<input id={name} name={name} type={type} min={min} max={max} inputMode={inputMode} className="auth-input" required={required} /></label>; }
function Status({ label, status }: { readonly label: string; readonly status: WithdrawalStatus }): ReactElement { let colors = "bg-[var(--emerald)]/10 text-[var(--emerald)]"; if (status === "REVIEW" || status === "APPROVED") colors = "bg-[var(--gold)]/10 text-[var(--gold)]"; if (status === "REJECTED") colors = "bg-[var(--error)]/10 text-[var(--error)]"; return <span className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${colors}`}>{label}</span>; }
function EmptyState({ title, description }: { readonly title: string; readonly description: string }): ReactElement { return <div className="grid min-h-48 place-items-center p-5 text-center"><div className="max-w-sm"><WalletCards className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" /><h2 className="mt-3 font-extrabold text-[var(--charcoal)]">{title}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-muted)]">{description}</p></div></div>; }
function Notice({ notice, text }: { readonly notice?: string; readonly text: Text }): ReactElement | null { if (notice === "requested") return <p className="rounded-lg border border-[var(--emerald)]/20 bg-[var(--emerald)]/10 p-3 text-sm font-bold text-[var(--emerald)]">{text.requestedNotice}</p>; if (notice === "invalid") return <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold text-[var(--error)]">{text.invalidNotice}</p>; if (notice === "insufficient") return <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold text-[var(--error)]">{text.insufficientNotice}</p>; return null; }
