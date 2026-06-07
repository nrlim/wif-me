import type { Metadata } from "next";
import type { ReactElement } from "react";
import { FinanceRuleKind } from "@prisma/client";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FinanceRuleForm } from "@/components/forms/finance-rule-form";
import { getFinanceRule } from "@/lib/admin/data";
export const metadata: Metadata = { title: "Edit Charge" };
type EditChargeProps = { readonly params: Promise<{ readonly charge: string }> };
export default async function EditChargePage({ params }: EditChargeProps): Promise<ReactElement> { const { charge } = await params; const row = await getFinanceRule(FinanceRuleKind.CHARGE, charge); if (!row) notFound(); const t = await getTranslations("Admin.finance"); return <div className="flex flex-col gap-5"><section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("charges.eyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold text-[var(--charcoal)]">{t("charges.editTitle")}</h1><p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t("charges.addDescription")}</p></section><FinanceRuleForm actionPath="/admin/charges" titleLabel={t("settings.name")} valueLabel={t("settings.value")} statusLabel={t("settings.status")} submitLabel={t("actions.save")} cancelLabel={t("actions.back")} activeLabel={t("ruleStatuses.active")} draftLabel={t("ruleStatuses.draft")} initialTitle={row.title} initialValue={row.value} initialStatus={row.status === "ACTIVE" ? "active" : "draft"} /></div>; }
