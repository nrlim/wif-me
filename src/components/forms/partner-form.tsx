"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { PartnerRow, PartnerServiceKey, PartnerStatusKey, PartnerType } from "@/lib/constants/partners";

const SERVICE_OPTIONS: readonly PartnerServiceKey[] = ["muthawifPersonal", "providerMuthawif", "transportation"];
const STATUS_OPTIONS: readonly PartnerStatusKey[] = ["verified", "review", "paused"];

type PartnerFormText = {
  readonly name: string;
  readonly service: string;
  readonly city: string;
  readonly bookings: string;
  readonly status: string;
  readonly submit: string;
  readonly cancel: string;
  readonly services: Record<PartnerServiceKey, string>;
  readonly statuses: Record<PartnerStatusKey, string>;
};

type PartnerFormProps = {
  readonly locale: string;
  readonly type: PartnerType;
  readonly action: (formData: FormData) => Promise<never>;
  readonly text: PartnerFormText;
  readonly partner?: PartnerRow;
  readonly initialName?: string;
  readonly locations: readonly { readonly id: string; readonly name: string }[];
};

export function PartnerForm({ locale, type, action, text, partner, initialName = "", locations }: PartnerFormProps): ReactElement {
  const [name, setName] = useState(initialName);
  const generatedKey = useMemo(() => toCamelCase(name || partner?.key || "partner"), [name, partner?.key]);

  return (
    <form action={action} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="key" value={generatedKey} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="name">
          {text.name}
          <input id="name" name="name" value={name} onChange={(event) => setName(event.target.value)} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="serviceKey">
          {text.service}
          <select id="serviceKey" name="serviceKey" defaultValue={partner?.serviceKey ?? (type === "personal" ? "muthawifPersonal" : "providerMuthawif")} className="auth-select" required>
            {SERVICE_OPTIONS.map((option) => <option key={option} value={option}>{text.services[option]}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="baseLocationId">
          {text.city}
          <select id="baseLocationId" name="baseLocationId" defaultValue={partner?.baseLocationId ?? ""} className="auth-select" required>
            <option value="">Pilih Lokasi</option>
            {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="bookings">
          {text.bookings}
          <input id="bookings" name="bookings" type="number" min="0" defaultValue={partner?.bookings ?? 0} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="status">
          {text.status}
          <select id="status" name="status" defaultValue={partner?.status ?? "review"} className="auth-select" required>
            {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{text.statuses[option]}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={type === "personal" ? "/admin/partners/muthawif" : "/admin/partners/providers"} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.cancel}</Link>
        <button type="submit" className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">{text.submit}</button>
      </div>
    </form>
  );
}

function toSlug(value: string): string {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "partner";
}

function toCamelCase(value: string): string {
  const words = toSlug(value).split("-").filter(Boolean);
  return words.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("") || "partner";
}
