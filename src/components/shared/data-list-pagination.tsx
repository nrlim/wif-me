import type { ReactElement } from "react";

type DataListPaginationProps = {
  readonly label: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
};

export function DataListPagination({ label, previousLabel, nextLabel }: DataListPaginationProps): ReactElement {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white px-4 py-4 text-sm font-bold text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
      <p>{label}</p>
      <div className="flex gap-2">
        <button type="button" className="min-h-11 rounded-xl border border-[var(--border)] px-4 font-extrabold text-[var(--charcoal)]">
          {previousLabel}
        </button>
        <button type="button" className="min-h-11 rounded-xl bg-[var(--emerald)] px-4 font-extrabold text-white">
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
