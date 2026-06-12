import type { ProviderFleetStatus } from "@prisma/client";
import type { ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { ProviderFleetRow } from "@/lib/provider-management/data";

const STATUS_OPTIONS: readonly ProviderFleetStatus[] = ["AVAILABLE", "ASSIGNED", "MAINTENANCE"];

type ProviderFleetFormText = {
  readonly vehicleName: string;
  readonly vehicleType: string;
  readonly plateNumber: string;
  readonly capacity: string;
  readonly baseCity: string;
  readonly basePrice: string;
  readonly status: string;
  readonly notes: string;
  readonly submit: string;
  readonly cancel: string;
  readonly statusLabels: Record<ProviderFleetStatus, string>;
};

type ProviderFleetFormProps = {
  readonly action: (formData: FormData) => Promise<void>;
  readonly text: ProviderFleetFormText;
  readonly fleet?: ProviderFleetRow;
  readonly locations: readonly { readonly id: string; readonly name: string }[];
};

export function ProviderFleetForm({ action, text, fleet, locations }: ProviderFleetFormProps): ReactElement {
  return (
    <form action={action} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
      {fleet ? <input type="hidden" name="id" value={fleet.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={text.vehicleName} htmlFor="vehicleName"><input id="vehicleName" name="vehicleName" className="auth-input" required minLength={2} maxLength={160} defaultValue={fleet?.vehicleName ?? ""} /></Field>
        <Field label={text.vehicleType} htmlFor="vehicleType"><input id="vehicleType" name="vehicleType" className="auth-input" required minLength={2} maxLength={80} defaultValue={fleet?.vehicleType ?? ""} /></Field>
        <Field label={text.plateNumber} htmlFor="plateNumber"><input id="plateNumber" name="plateNumber" className="auth-input" maxLength={40} defaultValue={fleet?.plateNumber === "-" ? "" : fleet?.plateNumber ?? ""} /></Field>
        <Field label={text.capacity} htmlFor="capacity"><input id="capacity" name="capacity" className="auth-input" type="number" min={1} max={60} required defaultValue={fleet?.capacity ?? 4} /></Field>
        <Field label={text.baseCity} htmlFor="baseLocationId">
          <select id="baseLocationId" name="baseLocationId" className="auth-select" defaultValue={fleet?.baseLocationId ?? ""}>
            <option value="">Pilih Lokasi</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </Field>
        <PriceField label={text.basePrice} baseCurrency={fleet?.baseCurrency ?? "IDR"} originalPrice={fleet?.originalPrice ?? 0} />
        <Field label={text.status} htmlFor="status"><select id="status" name="status" className="auth-select" defaultValue={fleet?.status ?? "AVAILABLE"}>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{text.statusLabels[status]}</option>)}</select></Field>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="notes">
          {text.notes}
          <textarea id="notes" name="notes" rows={4} className="min-h-28 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" maxLength={800} defaultValue={fleet?.notes ?? ""} />
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/provider/fleet" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.cancel}</Link>
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
