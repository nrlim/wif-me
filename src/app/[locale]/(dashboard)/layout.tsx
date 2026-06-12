import type { ReactElement, ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { DashboardFeedback } from "@/components/shared/dashboard-feedback";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps): ReactElement {
  return (
    <div className="min-h-full dashboard-bg text-[var(--charcoal)]">
      {/* Sidebar for desktop */}
      <DashboardSidebar />

      <DashboardLayoutClient>
        <DashboardHeader />

        <main className="flex-1 pb-28 pt-5 md:py-10">
          <div className="mx-auto max-w-7xl px-3 sm:px-6">
            {children}
          </div>
        </main>
      </DashboardLayoutClient>

      <DashboardMobileNav />
      <DashboardFeedback />
    </div>
  );
}
