import type { ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { FeeStatus } from "@/lib/constants/admin-finance";

type FinanceRuleFormProps = {
  readonly actionPath: "/admin/fees" | "/admin/charges";
  readonly titleLabel: string;
  readonly valueLabel: string;
  readonly statusLabel: string;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly activeLabel: string;
  readonly draftLabel: string;
  readonly initialTitle?: string;
  readonly initialValue?: string;
  readonly initialStatus?: FeeStatus;
};

export function FinanceRuleForm({ actionPath, titleLabel, valueLabel, statusLabel, submitLabel, cancelLabel, activeLabel, draftLabel, initialTitle = "", initialValue = "", initialStatus = "draft" }: FinanceRuleFormProps): ReactElement {
  return <form className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5"><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="title">{titleLabel}<input id="title" name="title" defaultValue={initialTitle} className="auth-input" required /></label><label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="value">{valueLabel}<input id="value" name="value" defaultValue={initialValue} className="auth-input" required /></label><label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="status">{statusLabel}<select id="status" name="status" defaultValue={initialStatus} className="auth-select"><option value="active">{activeLabel}</option><option value="draft">{draftLabel}</option></select></label></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href={actionPath} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{cancelLabel}</Link><button type="submit" className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">{submitLabel}</button></div></form>;
}
