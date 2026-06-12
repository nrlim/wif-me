"use client";

import { useTransition, type ReactElement } from "react";
import { toggleMuthawifAvailabilityAction } from "@/app/[locale]/(dashboard)/muthawif/actions";
import { StatusBadge } from "@/components/shared/status-badge";

type AvailabilityToggleProps = {
  readonly initialIsAvailable: boolean;
  readonly labels: {
    readonly available: string;
    readonly notAvailable: string;
    readonly toggleLabel: string;
    readonly activeBookingsWarning: string;
  };
};

export function AvailabilityToggle({ initialIsAvailable, labels }: AvailabilityToggleProps): ReactElement {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAvailable = e.target.checked;
    const formData = new FormData();
    formData.append("isAvailable", String(isAvailable));

    startTransition(async () => {
      try {
        const result = await toggleMuthawifAvailabilityAction(formData);
        if (result?.warning === "active-bookings") {
          alert(labels.activeBookingsWarning);
        }
      } catch (error) {
        console.error("Failed to toggle availability", error);
      }
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-2 shadow-sm">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-[var(--text-muted)]">{labels.toggleLabel}</span>
        <div className="mt-1">
          <StatusBadge 
            label={initialIsAvailable ? labels.available : labels.notAvailable} 
            variant={initialIsAvailable ? "success" : "neutral"} 
          />
        </div>
      </div>
      <label className="relative ml-2 inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={initialIsAvailable}
          onChange={handleToggle}
          disabled={isPending}
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--emerald)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--emerald)]/20 disabled:cursor-not-allowed disabled:opacity-50"></div>
      </label>
    </div>
  );
}
