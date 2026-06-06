import type { ReactElement, ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps): ReactElement {
  return (
    <div className="min-h-full bg-[var(--ivory)] text-[var(--charcoal)]">
      {/* Sidebar for desktop */}
      <DashboardSidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardHeader />

        <main className="flex-1 py-10">
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
