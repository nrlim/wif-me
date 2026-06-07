import { type ReactElement } from "react";
import { cn } from "@/lib/utils/cn";

export type StatusBadgeVariant = "success" | "warning" | "danger" | "neutral";

type StatusBadgeProps = {
  readonly label: string;
  readonly variant?: StatusBadgeVariant;
  readonly className?: string;
};

export function StatusBadge({ label, variant = "neutral", className }: StatusBadgeProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-extrabold",
        variant === "success" && "bg-[var(--emerald)]/10 text-[var(--emerald)]",
        variant === "warning" && "bg-[var(--gold)]/10 text-[var(--gold)]",
        variant === "danger" && "bg-[var(--error)]/10 text-[var(--error)]",
        variant === "neutral" && "bg-gray-100 text-gray-700",
        className
      )}
    >
      {label}
    </span>
  );
}
