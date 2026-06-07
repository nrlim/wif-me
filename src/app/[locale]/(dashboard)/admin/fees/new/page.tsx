import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getTranslations } from "next-intl/server";
import { FinanceRuleForm } from "@/components/forms/finance-rule-form";
export const metadata: Metadata = { title: "Tambah Biaya" };
export default async function NewFeePage(): Promise<ReactElement> { const t = await getTranslations("Admin.finance"); return <div className="flex flex-col gap-5"><section className="hidden max-w-3xl md:block"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("fees.eyebrow")}</p><h1 className="mt-2 text-2xl font-extrabold text-[var(--charcoal)]">{t("fees.addTitle")}</h1><p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t("fees.addDescription")}</p></section><FinanceRuleForm actionPath="/admin/fees" titleLabel={t("settings.name")} valueLabel={t("settings.value")} statusLabel={t("settings.status")} submitLabel={t("actions.save")} cancelLabel={t("actions.back")} activeLabel={t("ruleStatuses.active")} draftLabel={t("ruleStatuses.draft")} /></div>; }
