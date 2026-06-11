import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { requireRoleSession } from "@/lib/auth/current-session";
import { ProfileTabs } from "./profile-tabs";

export const metadata: Metadata = { title: "Profil Jamaah" };

type JamaahProfileLayoutProps = {
  readonly children: ReactNode;
};

export default async function JamaahProfileLayout({ children }: JamaahProfileLayoutProps): Promise<ReactElement> {
  await requireRoleSession([UserRole.JAMAAH]);
  const t = await getTranslations("Jamaah.profile");

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <ProfileTabs tabs={[{ name: t("tabs.general"), href: "/jamaah/profile" }, { name: t("tabs.security"), href: "/jamaah/profile/security" }]} />
      {children}
    </div>
  );
}
