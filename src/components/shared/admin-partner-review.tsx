import { ServiceType, VerificationStatus } from "@prisma/client";
import Image from "next/image";
import type { ReactElement } from "react";
import { Building2, CheckCircle2, Clock3, FileText, MapPin, UserCheck, XCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { AdminPartnerReviewDetail } from "@/lib/admin/partner-review";

type AdminPartnerReviewText = {
  readonly eyebrow: string;
  readonly description: string;
  readonly back: string;
  readonly legalTitle: string;
  readonly contactTitle: string;
  readonly profileTitle: string;
  readonly logoTitle: string;
  readonly actionTitle: string;
  readonly approve: string;
  readonly reject: string;
  readonly rejectionReason: string;
  readonly rejectionPlaceholder: string;
  readonly currentStatus: string;
  readonly noLogo: string;
  readonly empty: string;
  readonly fields: {
    readonly companyType: string;
    readonly registrationNumber: string;
    readonly taxId: string;
    readonly status: string;
    readonly email: string;
    readonly phone: string;
    readonly whatsapp: string;
    readonly website: string;
    readonly baseLocation: string;
    readonly address: string;
    readonly services: string;
    readonly languages: string;
    readonly bookings: string;
    readonly staff: string;
    readonly fleet: string;
  };
  readonly statuses: Record<VerificationStatus, string>;
  readonly services: Record<ServiceType, string>;
};

type AdminPartnerReviewProps = {
  readonly locale: string;
  readonly partner: AdminPartnerReviewDetail;
  readonly logoUrl: string | null;
  readonly text: AdminPartnerReviewText;
  readonly approveAction: (formData: FormData) => Promise<never>;
  readonly rejectAction: (formData: FormData) => Promise<never>;
};

export function AdminPartnerReview({ locale, partner, logoUrl, text, approveAction, rejectAction }: AdminPartnerReviewProps): ReactElement {
  const Icon = partner.type === "personal" ? UserCheck : Building2;
  const listHref = partner.type === "personal" ? "/admin/partners/muthawif" : "/admin/partners/providers";
  const serviceTypes = partner.serviceTypes.length > 0 ? partner.serviceTypes : [partner.type === "personal" ? ServiceType.MUTHAWIF_PERSONAL : ServiceType.PROVIDER_MUTHAWIF];
  const canReview = partner.verificationStatus === VerificationStatus.PENDING || partner.verificationStatus === VerificationStatus.DRAFT;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="hidden max-w-3xl md:block">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{text.eyebrow}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{partner.name}</h1>
          <p className="mt-3 text-sm font-medium leading-7 text-[var(--text-muted)]">{text.description}</p>
        </div>
        <Link href={listHref} className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-extrabold text-[var(--charcoal)]">{text.back}</Link>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-4">
          <InfoPanel icon={<FileText className="size-5" aria-hidden="true" />} title={text.legalTitle}>
            <DetailGrid items={[
              { label: text.fields.companyType, value: partner.companyType ?? text.empty },
              { label: text.fields.registrationNumber, value: partner.registrationNumber ?? text.empty },
              { label: text.fields.taxId, value: partner.taxId ?? text.empty },
              { label: text.fields.status, value: text.statuses[partner.verificationStatus] },
            ]} />
          </InfoPanel>

          <InfoPanel icon={<MapPin className="size-5" aria-hidden="true" />} title={text.contactTitle}>
            <DetailGrid items={[
              { label: text.fields.email, value: partner.email },
              { label: text.fields.phone, value: partner.phone ?? text.empty },
              { label: text.fields.whatsapp, value: partner.whatsapp ?? text.empty },
              { label: text.fields.website, value: partner.website ?? text.empty },
              { label: text.fields.baseLocation, value: partner.baseLocationName ?? text.empty },
              { label: text.fields.address, value: partner.address ?? text.empty, wide: true },
            ]} />
          </InfoPanel>

          <InfoPanel icon={<Icon className="size-5" aria-hidden="true" />} title={text.profileTitle}>
            <DetailGrid items={[
              { label: text.fields.services, value: serviceTypes.map((service) => text.services[service]).join(" · ") },
              { label: text.fields.languages, value: partner.languages.length > 0 ? partner.languages.join(" · ") : text.empty },
              { label: text.fields.bookings, value: String(partner.bookingCount) },
              { label: text.fields.staff, value: String(partner.staffCount) },
              { label: text.fields.fleet, value: String(partner.fleetCount) },
            ]} />
          </InfoPanel>
        </div>

        <aside className="grid gap-4">
          <InfoPanel icon={<Building2 className="size-5" aria-hidden="true" />} title={text.logoTitle}>
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4">
              {logoUrl ? <Image src={logoUrl} alt={partner.companyName ?? partner.name} width={220} height={120} className="max-h-32 w-auto object-contain" /> : <p className="text-sm font-bold text-[var(--text-muted)]">{text.noLogo}</p>}
            </div>
          </InfoPanel>

          <InfoPanel icon={<Clock3 className="size-5" aria-hidden="true" />} title={text.actionTitle}>
            {canReview ? (
              <div className="grid gap-3">
                <form action={approveAction}>
                  <HiddenReviewFields locale={locale} partner={partner} />
                  <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[var(--emerald-light)]"><CheckCircle2 className="size-4" aria-hidden="true" />{text.approve}</button>
                </form>
                <form action={rejectAction} className="grid gap-3 border-t border-[var(--border)] pt-4">
                  <HiddenReviewFields locale={locale} partner={partner} />
                  <label className="grid gap-1.5 text-xs font-extrabold text-[var(--charcoal)]" htmlFor="rejectionReason">{text.rejectionReason}<textarea id="rejectionReason" name="rejectionReason" className="min-h-24 w-full rounded-lg border border-[#dfe4df] bg-[#fbfaf6] px-3 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-[var(--emerald)] focus:bg-white" placeholder={text.rejectionPlaceholder} required /></label>
                  <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-extrabold text-[var(--error)] transition-colors hover:bg-red-100"><XCircle className="size-4" aria-hidden="true" />{text.reject}</button>
                </form>
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-4 text-sm font-bold text-[var(--text-muted)]">
                <p>{text.currentStatus}: <span className="text-[var(--charcoal)]">{text.statuses[partner.verificationStatus]}</span></p>
                {partner.rejectionReason ? <p className="mt-2 text-xs leading-5 text-[var(--error)]">{partner.rejectionReason}</p> : null}
              </div>
            )}
          </InfoPanel>
        </aside>
      </section>
    </div>
  );
}

function InfoPanel({ icon, title, children }: { readonly icon: ReactElement; readonly title: string; readonly children: ReactElement }): ReactElement {
  return <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5"><div className="mb-4 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-[var(--emerald-pale)] text-[var(--emerald)]">{icon}</span><h2 className="text-base font-extrabold text-[var(--charcoal)]">{title}</h2></div>{children}</section>;
}

function DetailGrid({ items }: { readonly items: readonly { readonly label: string; readonly value: string; readonly wide?: boolean }[] }): ReactElement {
  return <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => <div key={item.label} className={item.wide ? "sm:col-span-2 lg:col-span-3 xl:col-span-4" : undefined}><dt className="text-xs font-extrabold text-[var(--text-muted)]">{item.label}</dt><dd className="mt-1 font-semibold leading-6 text-[var(--charcoal)]">{item.value}</dd></div>)}</dl>;
}

function HiddenReviewFields({ locale, partner }: { readonly locale: string; readonly partner: AdminPartnerReviewDetail }): ReactElement {
  return <><input type="hidden" name="locale" value={locale} /><input type="hidden" name="partnerId" value={partner.userId} /><input type="hidden" name="partnerType" value={partner.type} /></>;
}
