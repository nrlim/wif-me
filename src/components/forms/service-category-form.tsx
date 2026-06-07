"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { PriceModelKey, ServiceStatusKey } from "@/lib/constants/services";

const PRICE_MODEL_OPTIONS: readonly PriceModelKey[] = ["currency", "b2b", "route", "document", "custom"];
const STATUS_OPTIONS: readonly ServiceStatusKey[] = ["active", "draft"];

type CategoryFormText = {
  readonly title: string;
  readonly description: string;
  readonly priceModel: string;
  readonly order: string;
  readonly status: string;
  readonly submit: string;
  readonly cancel: string;
  readonly priceModels: Record<PriceModelKey, string>;
  readonly statuses: Record<ServiceStatusKey, string>;
};

type ServiceCategoryFormProps = {
  readonly locale: string;
  readonly action: (formData: FormData) => Promise<never>;
  readonly text: CategoryFormText;
  readonly category?: { readonly key: string; readonly slug: string; readonly priceModelKey: PriceModelKey; readonly order: number; readonly status: ServiceStatusKey };
  readonly initialTitle?: string;
  readonly initialDescription?: string;
};

export function ServiceCategoryForm({ locale, action, text, category, initialTitle = "", initialDescription = "" }: ServiceCategoryFormProps): ReactElement {
  const [title, setTitle] = useState(initialTitle);
  const generatedSlug = useMemo(() => toSlug(title || category?.slug || "service-category"), [category?.slug, title]);
  const generatedKey = useMemo(() => toCamelCase(title || category?.key || "serviceCategory"), [category?.key, title]);

  return (
    <form action={action} className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="key" value={generatedKey} />
      <input type="hidden" name="slug" value={generatedSlug} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="title">
          {text.title}
          <input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-2" htmlFor="description">
          {text.description}
          <textarea id="description" name="description" defaultValue={initialDescription} className="min-h-28 w-full rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-[var(--emerald)] focus:bg-white" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="priceModelKey">
          {text.priceModel}
          <select id="priceModelKey" name="priceModelKey" defaultValue={category?.priceModelKey ?? "currency"} className="auth-select" required>
            {PRICE_MODEL_OPTIONS.map((option) => <option key={option} value={option}>{text.priceModels[option]}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="order">
          {text.order}
          <input id="order" name="order" type="number" min="1" max="99" defaultValue={category?.order ?? 1} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="status">
          {text.status}
          <select id="status" name="status" defaultValue={category?.status ?? "draft"} className="auth-select" required>
            {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{text.statuses[option]}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/admin/services/categories" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.cancel}</Link>
        <button type="submit" className="min-h-11 rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white">{text.submit}</button>
      </div>
    </form>
  );
}

function toSlug(value: string): string {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "service-category";
}

function toCamelCase(value: string): string {
  const words = toSlug(value).split("-").filter(Boolean);
  if (words.length === 0) return "serviceCategory";
  return words.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("");
}
