import type { Metadata } from "next";
import type { ReactElement } from "react";
import { FinanceRuleKind } from "@prisma/client";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getFinanceRule } from "@/lib/admin/data";
export const metadata: Metadata = { title: "Hapus Charge" };
type DeleteChargeProps = { readonly params: Promise<{ readonly charge: string }> };
export default async function DeleteChargePage({ params }: DeleteChargeProps): Promise<ReactElement> { const { charge } = await params; const row = await getFinanceRule(FinanceRuleKind.CHARGE, charge); if (!row) notFound(); const t = await getTranslations("Admin.finance"); return <section className="max-w-2xl rounded-xl border border-[var(--border)] bg-white p-5"><h1 className="text-2xl font-extrabold text-[var(--charcoal)]">{t("charges.deleteTitle", { name: row.title })}</h1><p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t("charges.deleteDescription")}</p><div className="mt-5 flex gap-2"><Link href="/admin/charges" className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 font-extrabold">{t("actions.back")}</Link><button className="min-h-11 rounded-lg bg-[var(--error)] px-5 font-extrabold text-white">{t("actions.delete")}</button></div></section>; }
