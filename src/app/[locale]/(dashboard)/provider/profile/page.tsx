import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, Globe2, Languages, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { UserRole } from "@prisma/client";
import { updateProviderProfileAction } from "@/app/[locale]/(dashboard)/provider/actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getProviderProfile } from "@/lib/partner/data";
import { getPublicLocations } from "@/lib/services/public-data";

export const metadata: Metadata = { title: "General Profile Provider" };

type ProviderProfilePageProps = {
  readonly searchParams: Promise<{ readonly notice?: string }>;
};

export default async function ProviderProfilePage({ searchParams }: ProviderProfilePageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const [t, common, params, profile, locations] = await Promise.all([
    getTranslations("Partner.provider.profile"),
    getTranslations("Partner.common"),
    searchParams,
    getProviderProfile(session.userId),
    getPublicLocations(),
  ]);

  if (!profile) notFound();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[var(--emerald)] text-xl font-extrabold text-white">{profile.displayName.charAt(0).toUpperCase()}</div>
          <div><h1 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--charcoal)]">{profile.displayName}</h1><p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{profile.email}</p></div>
        </div>

        {params.notice ? <Notice type={params.notice} saved={t("notices.saved")} invalid={t("notices.invalid")} /> : null}

        <form action={updateProviderProfileAction} className="mt-6 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("fields.name")} htmlFor="name"><input id="name" name="name" className="auth-input pl-4" type="text" autoComplete="name" defaultValue={profile.name} required minLength={2} maxLength={160} /></Field>
            <Field label={t("fields.displayName")} htmlFor="displayName"><input id="displayName" name="displayName" className="auth-input pl-4" type="text" defaultValue={profile.displayName} required minLength={2} maxLength={180} /></Field>
            <Field label={t("fields.companyName")} htmlFor="companyName"><input id="companyName" name="companyName" className="auth-input pl-4" type="text" defaultValue={profile.companyName} required minLength={2} maxLength={200} /></Field>
            <Field label={t("fields.companyType")} htmlFor="companyType"><input id="companyType" name="companyType" className="auth-input pl-4" type="text" defaultValue={profile.companyType} required minLength={2} maxLength={80} placeholder={t("fields.companyTypePlaceholder")} /></Field>
            <Field label={t("fields.registrationNumber")} htmlFor="registrationNumber"><input id="registrationNumber" name="registrationNumber" className="auth-input pl-4" type="text" defaultValue={profile.registrationNumber} maxLength={80} /></Field>
            <Field label={t("fields.taxId")} htmlFor="taxId"><input id="taxId" name="taxId" className="auth-input pl-4" type="text" defaultValue={profile.taxId} maxLength={40} /></Field>
            <Field label={t("fields.phone")} htmlFor="phone"><input id="phone" name="phone" className="auth-input pl-4" type="tel" autoComplete="tel" defaultValue={profile.phone} maxLength={32} placeholder={t("fields.phonePlaceholder")} /></Field>
            <Field label={t("fields.whatsapp")} htmlFor="whatsapp"><input id="whatsapp" name="whatsapp" className="auth-input pl-4" type="tel" defaultValue={profile.whatsapp} maxLength={32} placeholder={t("fields.phonePlaceholder")} /></Field>
            <Field label={t("fields.baseCity")} htmlFor="baseLocationId">
              <select id="baseLocationId" name="baseLocationId" className="auth-select pl-4" defaultValue={profile.baseLocationId ?? ""}>
                <option value="">Pilih Lokasi</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </Field>
            <Field label={t("fields.country")} htmlFor="country"><input id="country" name="country" className="auth-input pl-4" type="text" defaultValue={profile.country} required minLength={2} maxLength={4} /></Field>
          </div>
          <Field label={t("fields.email")} htmlFor="email"><input id="email" className="auth-input pl-4" type="email" defaultValue={profile.email} disabled aria-describedby="email-helper" /></Field>
          <Field label={t("fields.website")} htmlFor="website"><input id="website" name="website" className="auth-input pl-4" type="url" defaultValue={profile.website} maxLength={255} placeholder={t("fields.websitePlaceholder")} /></Field>
          <Field label={t("fields.languages")} htmlFor="languages"><input id="languages" name="languages" className="auth-input pl-4" type="text" defaultValue={profile.languages.join(", ")} maxLength={240} placeholder={t("fields.languagesPlaceholder")} /></Field>
          <TextArea label={t("fields.address")} htmlFor="address" name="address" defaultValue={profile.address} placeholder={t("fields.addressPlaceholder")} />
          <TextArea label={t("fields.bio")} htmlFor="bio" name="bio" defaultValue={profile.bio} placeholder={t("fields.bioPlaceholder")} />
          <p id="email-helper" className="text-sm font-semibold leading-6 text-[var(--text-muted)]">{t("emailHelper")}</p>
          <div className="border-t border-[var(--border)] pt-5"><button type="submit" className="min-h-11 w-full rounded-lg bg-[var(--emerald)] px-5 text-sm font-extrabold text-white md:w-fit">{t("actions.saveProfile")}</button></div>
        </form>
      </section>

      <aside className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5">
        <Building2 className="size-8 text-[var(--emerald)]" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-extrabold text-[var(--charcoal)]">{t("summary.title")}</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <SummaryItem icon={<BadgeCheck className="size-4" aria-hidden="true" />} label={t("summary.verification")} value={common(`verification.${profile.verificationStatus}`)} />
          <SummaryItem icon={<MapPin className="size-4" aria-hidden="true" />} label={t("summary.city")} value={profile.baseCity || "-"} />
          <SummaryItem icon={<Languages className="size-4" aria-hidden="true" />} label={t("summary.languages")} value={profile.languages.length > 0 ? profile.languages.join(", ") : "-"} />
          <SummaryItem icon={<Globe2 className="size-4" aria-hidden="true" />} label={t("summary.website")} value={profile.website || "-"} />
          <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-bold text-[var(--text-muted)]">{t("summary.email")}</p><div className="mt-2"><StatusBadge label={profile.emailVerified ? t("summary.verified") : t("summary.notVerified")} variant={profile.emailVerified ? "success" : "warning"} /></div></div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, htmlFor, children }: { readonly label: string; readonly htmlFor: string; readonly children: ReactElement }): ReactElement {
  return <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor={htmlFor}>{label}{children}</label>;
}

function TextArea({ label, htmlFor, name, defaultValue, placeholder }: { readonly label: string; readonly htmlFor: string; readonly name: string; readonly defaultValue: string; readonly placeholder: string }): ReactElement {
  return <label className="grid gap-2 text-sm font-extrabold text-[var(--charcoal)]" htmlFor={htmlFor}>{label}<textarea id={htmlFor} name={name} rows={4} className="min-h-28 rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[var(--charcoal)] outline-none focus:border-[var(--emerald)] focus:bg-white" defaultValue={defaultValue} maxLength={800} placeholder={placeholder} /></label>;
}

function Notice({ type, saved, invalid }: { readonly type: string; readonly saved: string; readonly invalid: string }): ReactElement | null {
  if (type === "saved") return <p className="mt-5 rounded-xl border border-[var(--emerald)]/20 bg-[var(--emerald)]/5 px-4 py-3 text-sm font-bold text-[var(--emerald)]" role="status">{saved}</p>;
  if (type === "invalid") return <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[var(--error)]" role="alert">{invalid}</p>;
  return null;
}

function SummaryItem({ icon, label, value }: { readonly icon: ReactElement; readonly label: string; readonly value: string }): ReactElement {
  return <div className="rounded-xl border border-[var(--border)] p-3"><p className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">{icon}{label}</p><p className="mt-1 break-words font-extrabold text-[var(--charcoal)]">{value}</p></div>;
}
