import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { requireRoleSession } from "@/lib/auth/current-session";
import { ProfileTabs } from "./profile-tabs";

export const metadata: Metadata = { title: "Profil Muthawif" };

type MuthawifProfileLayoutProps = {
  readonly children: ReactNode;
};

export default async function MuthawifProfileLayout({ children }: MuthawifProfileLayoutProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.MUTHAWIF]);
  const t = await getTranslations("Partner.muthawif.profile");

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <ProfileTabs tabs={[{ name: t("tabs.general"), href: "/muthawif/profile" }, { name: t("tabs.security"), href: "/muthawif/profile/security" }]} />
      {children}
    </div>
  );
}
