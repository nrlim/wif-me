import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPartnerReview } from "@/components/shared/admin-partner-review";
import { getAdminPartnerReviewDetail } from "@/lib/admin/partner-review";
import { getPublicUrl } from "@/lib/storage/supabase";
import { approvePartnerVerification, rejectPartnerVerification } from "../../../actions";

export const metadata: Metadata = { title: "Review Provider" };

type EditProviderPageProps = { readonly params: Promise<{ readonly locale: string; readonly partner: string }> };

export default async function EditProviderPage({ params }: EditProviderPageProps): Promise<ReactElement> {
  const { locale, partner: id } = await params;
  const [t, partner] = await Promise.all([
    getTranslations("Admin.partners"),
    getAdminPartnerReviewDetail(id, "provider"),
  ]);

  if (!partner) notFound();

  return <AdminPartnerReview locale={locale} partner={partner} logoUrl={getPublicUrl(partner.logoUrl)} approveAction={approvePartnerVerification} rejectAction={rejectPartnerVerification} text={{ eyebrow: t("review.providerEyebrow"), description: t("review.providerDescription"), back: t("review.backToProviders"), legalTitle: t("review.legalTitle"), contactTitle: t("review.contactTitle"), profileTitle: t("review.profileTitle"), logoTitle: t("review.logoTitle"), actionTitle: t("review.actionTitle"), approve: t("review.approve"), reject: t("review.reject"), rejectionReason: t("review.rejectionReason"), rejectionPlaceholder: t("review.rejectionPlaceholder"), currentStatus: t("review.currentStatus"), noLogo: t("review.noLogo"), empty: t("review.empty"), fields: { companyType: t("review.fields.companyType"), registrationNumber: t("review.fields.registrationNumber"), taxId: t("review.fields.taxId"), status: t("review.fields.status"), email: t("review.fields.email"), phone: t("review.fields.phone"), whatsapp: t("review.fields.whatsapp"), website: t("review.fields.website"), baseLocation: t("review.fields.baseLocation"), address: t("review.fields.address"), services: t("review.fields.services"), languages: t("review.fields.languages"), bookings: t("review.fields.bookings"), staff: t("review.fields.staff"), fleet: t("review.fields.fleet") }, statuses: { DRAFT: t("verificationStatuses.draft"), PENDING: t("verificationStatuses.pending"), APPROVED: t("verificationStatuses.approved"), REJECTED: t("verificationStatuses.rejected") }, services: { MUTHAWIF_PERSONAL: t("serviceTypes.muthawifPersonal"), PROVIDER_MUTHAWIF: t("serviceTypes.providerMuthawif"), TRANSPORTATION: t("serviceTypes.transportation"), VISA_PROCESSING: t("serviceTypes.visaProcessing"), ADDITIONAL_SERVICE: t("serviceTypes.additionalServices") } }} />;
}
