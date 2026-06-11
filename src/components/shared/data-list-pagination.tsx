import type { ReactElement } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

type DataListPaginationProps = {
  readonly label: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
  readonly previousHref?: string;
  readonly nextHref?: string;
};

export function DataListPagination({ label, previousLabel, nextLabel, previousHref, nextHref }: DataListPaginationProps): ReactElement {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white px-4 py-4 text-sm font-bold text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
      <p>{label}</p>
      <div className="flex gap-2">
        <PaginationControl href={previousHref} label={previousLabel} variant="outline" />
        <PaginationControl href={nextHref} label={nextLabel} variant="primary" />
      </div>
    </div>
  );
}

function PaginationControl({ href, label, variant }: { readonly href?: string; readonly label: string; readonly variant: "outline" | "primary" }): ReactElement {
  const className = cn(
    "inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-extrabold",
    variant === "outline" ? "border border-[var(--border)] text-[var(--charcoal)]" : "bg-[var(--emerald)] text-white",
    !href && "pointer-events-none opacity-45"
  );

  if (!href) {
    return <span className={className}>{label}</span>;
  }

  return <Link href={href} className={className}>{label}</Link>;
}
