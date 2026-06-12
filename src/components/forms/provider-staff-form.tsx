import type { ProviderStaffStatus } from "@prisma/client";
import type { ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { ProviderStaffRow } from "@/lib/provider-management/data";

const STATUS_OPTIONS: readonly ProviderStaffStatus[] = ["ACTIVE", "ON_DUTY", "INACTIVE"];

type ProviderStaffFormText = {
  readonly name: string;
  readonly roleTitle: string;
  readonly email: string;
  readonly phone: string;
  readonly languages: string;
  readonly basePrice: string;
  readonly status: string;
  readonly notes: string;
  readonly submit: string;
  readonly cancel: string;
  readonly statusLabels: Record<ProviderStaffStatus, string>;
};

type ProviderStaffFormProps = {
  readonly action: (formData: FormData) => Promise<void>;
  readonly text: ProviderStaffFormText;
  readonly staff?: ProviderStaffRow;
};

export function ProviderStaffForm({ action, text, staff }: ProviderStaffFormProps): ReactElement {
  return (
    <form action={action} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
      {staff ? <input type="hidden" name="id" value={staff.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.name} htmlFor="name"><input id="name" name="name" className="auth-input" required minLength={2} maxLength={160} defaultValue={staff?.name ?? ""} /></Field>
        <Field label={text.roleTitle} htmlFor="roleTitle"><input id="roleTitle" name="roleTitle" className="auth-input" required minLength={2} maxLength={120} defaultValue={staff?.roleTitle ?? ""} /></Field>
        <Field label={text.email} htmlFor="email"><input id="email" name="email" type="email" className="auth-input" maxLength={255} defaultValue={staff?.email ?? ""} /></Field>
        <Field label={text.phone} htmlFor="phone"><input id="phone" name="phone" className="auth-input" type="tel" maxLength={32} defaultValue={staff?.phone === "-" ? "" : staff?.phone ?? ""} /></Field>
        <Field label={text.languages} htmlFor="languages"><input id="languages" name="languages" className="auth-input" maxLength={240} defaultValue={staff?.languages.join(", ") ?? ""} /></Field>
        <PriceField label={text.basePrice} baseCurrency={staff?.baseCurrency ?? "IDR"} originalPrice={staff?.originalPrice ?? 0} />
        <Field label={text.status} htmlFor="status"><select id="status" name="status" className="auth-select" defaultValue={staff?.status ?? "ACTIVE"}>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{text.statusLabels[status]}</option>)}</select></Field>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="notes">
          {text.notes}
          <textarea id="notes" name="notes" rows={4} className="min-h-28 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" maxLength={800} defaultValue={staff?.notes ?? ""} />
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/provider/staff" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.cancel}</Link>
        <button type="submit" className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">{text.submit}</button>
      </div>
    </form>
  );
}

function PriceField({ label, baseCurrency, originalPrice }: { readonly label: string; readonly baseCurrency: "IDR" | "SAR" | "USD"; readonly originalPrice: number }): ReactElement {
  return <div className="grid gap-1.5"><label className="text-xs font-extrabold text-[var(--charcoal)]" htmlFor="originalPrice">{label}</label><div className="flex gap-2"><div className="w-24 shrink-0"><select id="baseCurrency" name="baseCurrency" defaultValue={baseCurrency} className="auth-select px-2" required><option value="IDR">IDR</option><option value="SAR">SAR</option><option value="USD">USD</option></select></div><input id="originalPrice" name="originalPrice" type="number" min="0" defaultValue={toPriceInputValue(originalPrice)} className="auth-input flex-1" required /></div></div>;
}

function toPriceInputValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "0";
}

function Field({ label, htmlFor, children }: { readonly label: string; readonly htmlFor: string; readonly children: ReactElement }): ReactElement {
  return <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor={htmlFor}>{label}{children}</label>;
}
