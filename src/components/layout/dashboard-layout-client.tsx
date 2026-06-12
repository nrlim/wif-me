"use client";

import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { cn } from "@/lib/utils/cn";
import { useSyncExternalStore, type ReactNode, type ReactElement } from "react";

function subscribeToHydration(): () => void {
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

interface DashboardLayoutClientProps {
  readonly children: ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps): ReactElement {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const mounted = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);

  // We default to the expanded state (pl-64) before hydration to prevent layout shift if the user hasn't collapsed it
  const isActuallyCollapsed = mounted && isCollapsed;

  return (
    <div className={cn("flex min-h-screen flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]", isActuallyCollapsed ? "md:pl-20" : "md:pl-64")}>
      {children}
    </div>
  );
}
