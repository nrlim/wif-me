import { Search } from "lucide-react";
import type { ReactElement } from "react";

type SelectOption = {
  readonly value: string;
  readonly label: string;
};

type DataListToolbarProps = {
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly filterLabel: string;
  readonly sortLabel: string;
  readonly actionLabel: string;
  readonly filterName: string;
  readonly filterOptions: readonly SelectOption[];
  readonly sortOptions: readonly SelectOption[];
};

export function DataListToolbar({
  searchLabel,
  searchPlaceholder,
  filterLabel,
  sortLabel,
  actionLabel,
  filterName,
  filterOptions,
  sortOptions,
}: DataListToolbarProps): ReactElement {
  return (
    <form className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] bg-white p-3 shadow-none md:grid-cols-[1fr_180px_180px_auto] md:items-end" action="" method="GET">
      <label className="col-span-2 grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)] md:col-span-1" htmlFor="q">
        <span className="sr-only md:not-sr-only">{searchLabel}</span>
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <input id="q" name="q" type="search" className="auth-input auth-input-icon" placeholder={searchPlaceholder} />
        </span>
      </label>
      <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor={filterName}>
        <span className="sr-only md:not-sr-only">{filterLabel}</span>
        <select id={filterName} name={filterName} className="auth-select">
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="sort">
        <span className="sr-only md:not-sr-only">{sortLabel}</span>
        <select id="sort" name="sort" className="auth-select">
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="col-span-2 min-h-11 rounded-xl bg-[var(--emerald)] px-5 text-sm font-extrabold text-white md:col-span-1">
        {actionLabel}
      </button>
    </form>
  );
}
