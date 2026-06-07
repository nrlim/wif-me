import type { ReactElement } from "react";

type DashboardLoadingStateProps = {
  readonly label?: string;
};

export function DashboardLoadingState({ label = "Memuat data" }: DashboardLoadingStateProps): ReactElement {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[var(--border)] bg-white p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative flex size-12 items-center justify-center rounded-xl bg-[var(--emerald-pale)]">
          <span className="size-5 animate-spin rounded-full border-2 border-[var(--emerald)] border-t-transparent" />
        </span>
        <p className="text-sm font-extrabold text-[var(--charcoal)]">{label}</p>
      </div>
    </div>
  );
}
