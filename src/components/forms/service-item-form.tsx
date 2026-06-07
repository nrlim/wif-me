"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Link } from "@/i18n/routing";
import type { PlatformServiceConfig, ServiceStatusKey } from "@/lib/constants/services";

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
};

type ServiceItemFormProps = {
  readonly locale: string;
  readonly action: (formData: FormData) => Promise<never>;
  readonly text: ItemFormText;
  readonly service?: PlatformServiceConfig;
  readonly initialTitle?: string;
  readonly initialDescription?: string;
};

export function ServiceItemForm({ locale, action, text, service, initialTitle = "", initialDescription = "" }: ServiceItemFormProps): ReactElement {
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
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="basePriceIdr">
          {text.basePrice}
          <input id="basePriceIdr" name="basePriceIdr" type="number" min="0" defaultValue={service?.basePriceIdr ?? "0"} className="auth-input" required />
        </label>
        <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="durationKey">
          {text.duration}
          <input id="durationKey" name="durationKey" defaultValue={service?.durationKey ?? "oneDay"} className="auth-input" required />
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
