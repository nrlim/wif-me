"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useRef } from "react";
import { Search } from "lucide-react";
import type { PublicCategoryDetail, PublicCategoryFilters } from "@/lib/services/public-data";
import { useCartStore } from "@/hooks/use-cart-store";
import { MapPin } from "lucide-react";

const SOURCE_FILTERS = ["direct", "providerStaff"] as const;

type FilterText = {
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly all: string;
  readonly source: string;
  readonly personal: string;
  readonly provider: string;
  readonly vehicle: string;
  readonly location: string;
  readonly anyLocation: string;
  readonly submit: string;
};

type PublicServiceFilterFormProps = {
  readonly locations: readonly { readonly id: string; readonly name: string; readonly isAirport: boolean }[];
  readonly detail: PublicCategoryDetail;
  readonly filters: PublicCategoryFilters;
  readonly resultSummary: string;
  readonly text: FilterText;
};

export function PublicServiceFilterForm({ locations, detail, filters, resultSummary, text }: PublicServiceFilterFormProps): ReactElement {
  const formRef = useRef<HTMLFormElement>(null);
  const primaryLocationId = useCartStore((state) => state.getPrimaryLocationId());
  const showSource = detail.key === "muthawifPersonal";
  const showVehicles = detail.key === "transportation" && detail.vehicleTypes.length > 0;

  function submitOnOptionChange(event: ChangeEvent<HTMLInputElement>): void {
    if (event.currentTarget.checked) formRef.current?.requestSubmit();
  }

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm lg:p-4 lg:sticky lg:top-28">
      <form ref={formRef} className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4" method="get">
        {/* Location Filter */}
        <fieldset className="grid gap-2">
          <legend className="sr-only lg:not-sr-only lg:text-xs lg:font-bold lg:text-[var(--text-muted)]">{text.location}</legend>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <select
              name="loc"
              defaultValue={primaryLocationId || filters.locationId || ""}
              disabled={!!primaryLocationId}
              onChange={() => formRef.current?.requestSubmit()}
              className="h-10 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--ivory)] pl-10 pr-8 text-sm font-bold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:ring-2 focus:ring-[var(--emerald)]/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="">{text.anyLocation}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-[var(--text-muted)]">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </div>
          </div>
          {primaryLocationId ? <input type="hidden" name="loc" value={primaryLocationId} /> : null}
        </fieldset>

        {/* Search */}
        <div className="col-span-1">
          <label className="sr-only lg:not-sr-only lg:mb-2 lg:block lg:text-xs lg:font-bold lg:text-[var(--text-muted)]" htmlFor="service-q">{text.search}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <input id="service-q" name="q" defaultValue={filters.q} className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--ivory)] pl-10 pr-3 text-sm font-medium text-[var(--charcoal)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--emerald)] focus:ring-2 focus:ring-[var(--emerald)]/15" placeholder={text.searchPlaceholder} />
          </div>
        </div>

        {/* Source filter */}
        {showSource ? (
          <fieldset className="col-span-2 grid gap-1.5 lg:col-span-1 lg:gap-2">
            <legend className="sr-only lg:not-sr-only lg:text-xs lg:font-bold lg:text-[var(--text-muted)]">{text.source}</legend>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-1 lg:gap-1.5">
              <SegmentedOption name="source" value="" label={text.all} count={detail.sourceCounts.direct + detail.sourceCounts.providerStaff} checked={(filters.source ?? "") === ""} onChange={submitOnOptionChange} />
              {SOURCE_FILTERS.map((source) => (
                <SegmentedOption key={source} name="source" value={source} label={source === "direct" ? text.personal : text.provider} count={detail.sourceCounts[source]} checked={filters.source === source} onChange={submitOnOptionChange} />
              ))}
            </div>
          </fieldset>
        ) : null}

        {/* Vehicle type filter */}
        {showVehicles ? (
          <fieldset className="col-span-2 grid gap-1.5 lg:col-span-1 lg:gap-2">
            <legend className="sr-only lg:not-sr-only lg:text-xs lg:font-bold lg:text-[var(--text-muted)]">{text.vehicle}</legend>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-1 lg:gap-1.5">
              <SegmentedOption name="vehicleType" value="" label={text.all} count={detail.totalOfferings} checked={(filters.vehicleType ?? "") === ""} onChange={submitOnOptionChange} />
              {detail.vehicleTypes.map((vt) => (
                <SegmentedOption key={vt.value} name="vehicleType" value={vt.value} label={vt.label} count={vt.count} checked={filters.vehicleType === vt.value} onChange={submitOnOptionChange} />
              ))}
            </div>
          </fieldset>
        ) : null}

        {/* Result summary */}
        <div className="hidden border-t border-[var(--border)] pt-3 lg:block">
          <p className="text-xs font-bold text-[var(--text-muted)]">{resultSummary}</p>
        </div>
        <button className="sr-only" type="submit">{text.submit}</button>
        <noscript>
          <button type="submit" className="col-span-2 mt-2 w-full rounded-lg bg-[var(--emerald)] px-4 py-2 text-sm font-extrabold text-white lg:col-span-1">{text.submit}</button>
        </noscript>
      </form>
    </aside>
  );
}

function SegmentedOption({ name, value, label, count, checked, onChange }: { readonly name: string; readonly value: string; readonly label: string; readonly count: number; readonly checked: boolean; readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void }): ReactElement {
  return (
    <label className={[
      "flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-colors",
      checked ? "border-[var(--emerald)] bg-[var(--emerald)]/5 text-[var(--emerald)]" : "border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--emerald)]/30",
    ].join(" ")}>
      <span className="flex min-w-0 items-center gap-2">
        <input type="radio" name={name} value={value} defaultChecked={checked} onChange={onChange} className="size-3.5 shrink-0 accent-[var(--emerald)]" />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-[11px] font-bold text-[var(--text-muted)]">{count}</span>
    </label>
  );
}
