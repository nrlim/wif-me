"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { ServiceStatusKey } from "@/lib/constants/services";

const STATUS_OPTIONS: readonly ServiceStatusKey[] = ["active", "draft"];

type ItemFormText = {
  readonly category: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly basePrice: string;
  readonly duration: string;
  readonly status: string;
  readonly submit: string;
  readonly cancel: string;
  readonly statuses: Record<ServiceStatusKey, string>;
  readonly categories: readonly { readonly key: string; readonly label: string }[];
  readonly baseLocation: string;
};

type EditableServiceItem = {
  readonly key?: string;
  readonly code?: string;
  readonly categoryKey?: string | null;
  readonly durationKey?: string;
  readonly status?: ServiceStatusKey;
  readonly baseCurrency?: "IDR" | "SAR" | "USD" | null;
  readonly originalPrice?: string | number | null;
  readonly basePriceIdr?: string | number;
  readonly baseLocationId?: string | null;
};

type ServiceItemFormProps = {
  readonly locale: string;
  readonly action: (formData: FormData) => Promise<never>;
  readonly text: ItemFormText;
  readonly service?: EditableServiceItem;
  readonly initialTitle?: string;
  readonly initialDescription?: string;
  readonly locations: readonly { readonly id: string; readonly name: string }[];
};

export function ServiceItemForm({ locale, action, text, service, initialTitle = "", initialDescription = "", locations }: ServiceItemFormProps): ReactElement {
  const [title, setTitle] = useState(initialTitle);
  const generatedKey = useMemo(() => toCamelCase(title || service?.key || "platformService"), [service?.key, title]);

  return (
    <form action={action} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="key" value={generatedKey} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="categoryKey">
          {text.category}
          <select id="categoryKey" name="categoryKey" defaultValue={service?.categoryKey ?? "muthawifPersonal"} className="auth-select" required>
            {text.categories.map((category) => <option key={category.key} value={category.key}>{category.label}</option>) }
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="title">
          {text.title}
          <input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="code">
          {text.code}
          <input id="code" name="code" defaultValue={service?.code ?? ""} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="description">
          {text.description}
          <textarea id="description" name="description" defaultValue={initialDescription} className="min-h-28 w-full rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-[var(--emerald)] focus:bg-white" required />
        </label>
        <div className="grid gap-1.5 md:col-span-2 lg:col-span-1">
          <label className="text-xs font-extrabold text-[var(--charcoal)]" htmlFor="originalPrice">
            {text.basePrice}
          </label>
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <select id="baseCurrency" name="baseCurrency" defaultValue={service?.baseCurrency ?? "IDR"} className="auth-select px-2" required>
                <option value="IDR">IDR</option>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <input id="originalPrice" name="originalPrice" type="number" min="0" defaultValue={service?.originalPrice ?? service?.basePriceIdr ?? "0"} className="auth-input flex-1" required />
          </div>
        </div>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="durationKey">
          {text.duration}
          <input id="durationKey" name="durationKey" defaultValue={service?.durationKey ?? "oneDay"} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="baseLocationId">
          {text.baseLocation}
          <select id="baseLocationId" name="baseLocationId" defaultValue={service?.baseLocationId ?? ""} className="auth-select">
            <option value="">(Bebas / Tidak Terikat)</option>
            {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="status">
          {text.status}
          <select id="status" name="status" defaultValue={service?.status ?? "draft"} className="auth-select" required>
            {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{text.statuses[option]}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/admin/services/items" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.cancel}</Link>
        <button type="submit" className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">{text.submit}</button>
      </div>
    </form>
  );
}

function toSlug(value: string): string {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "platform-service";
}

function toCamelCase(value: string): string {
  const words = toSlug(value).split("-").filter(Boolean);
  if (words.length === 0) return "platformService";
  return words.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("");
}
