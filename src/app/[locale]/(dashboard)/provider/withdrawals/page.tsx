import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { PartnerWithdrawalsPage } from "@/components/shared/partner-withdrawals-page";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPartnerWithdrawalData } from "@/lib/partner/withdrawals";

export const metadata: Metadata = { title: "Penarikan Provider" };

type PageProps = { readonly params: Promise<{ readonly locale: string }>; readonly searchParams: Promise<{ readonly notice?: string }> };

export default async function ProviderWithdrawalsPage({ params, searchParams }: PageProps): Promise<ReactElement> {
  const session = await requireRoleSession([UserRole.PROVIDER]);
  const [{ locale }, query, t, common, data] = await Promise.all([params, searchParams, getTranslations("Partner.provider.withdrawals"), getTranslations("Partner.common"), getPartnerWithdrawalData(session.userId)]);
  return <PartnerWithdrawalsPage locale={locale} notice={query.notice} summary={data.summary} rows={data.rows} text={{ eyebrow: t("eyebrow"), title: t("title"), description: t("description"), available: t("summary.available"), released: t("summary.released"), inReview: t("summary.inReview"), paid: t("summary.paid"), formTitle: t("form.title"), formDescription: t("form.description"), amount: t("form.amount"), bankName: t("form.bankName"), accountName: t("form.accountName"), accountNumber: t("form.accountNumber"), note: t("form.note"), submit: t("form.submit"), history: t("history"), emptyTitle: t("empty.title"), emptyDescription: t("empty.description"), requestedNotice: t("notices.requested"), invalidNotice: t("notices.invalid"), insufficientNotice: t("notices.insufficient"), statuses: { REVIEW: common("withdrawalStatuses.REVIEW"), APPROVED: common("withdrawalStatuses.APPROVED"), PAID: common("withdrawalStatuses.PAID"), REJECTED: common("withdrawalStatuses.REJECTED") }, columns: { reference: common("reference"), bank: t("columns.bank"), amount: common("amount"), status: common("status") }, page: common("pageSummary", { total: data.rows.length }), previous: common("previous"), next: common("next") }} />;
}
