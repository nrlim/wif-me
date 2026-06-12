import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPartnerDashboard } from "@/lib/partner/data";
import { redirect } from "next/navigation";
import { ProviderOnboardingForm } from "@/components/forms/provider-onboarding-form";

export const metadata: Metadata = {
  title: "Lengkapi Profil Perusahaan - Wif-Me",
};

export default async function ProviderOnboardingPage(): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const dashboard = await getPartnerDashboard(session.userId);

  // Jika sudah PENDING atau APPROVED, redirect ke dashboard utama
  if (dashboard.verificationStatus !== "DRAFT" && dashboard.verificationStatus !== "REJECTED") {
    redirect("/provider");
  }

  return (
    <div className="mx-auto max-w-4xl py-6 md:py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--charcoal)]">Verifikasi Profil Perusahaan</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Lengkapi data legalitas dan informasi instansi Anda untuk mulai bergabung sebagai Provider di platform Wif-Me.
        </p>
      </div>
      
      <ProviderOnboardingForm />
    </div>
  );
}
