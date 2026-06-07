import type { ReactNode, ReactElement } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileTabs } from "./profile-tabs";

export const metadata: Metadata = {
  title: "Admin Profile",
};

export default async function AdminProfileLayout({ children }: { readonly children: ReactNode }): Promise<ReactElement> {
  const t = await getTranslations("Admin.profile");
  
  return (
    <div className="flex flex-col gap-6">
      <section className="hidden max-w-3xl md:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)]">Pengaturan Profil</h1>
        <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">Kelola informasi pribadi dan pengaturan keamanan akun Anda.</p>
      </section>

      <ProfileTabs />

      {children}
    </div>
  );
}
