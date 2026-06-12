import type { Metadata } from "next";
import type { ReactElement } from "react";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProviderFleetForm } from "@/components/forms/provider-fleet-form";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getProviderFleetById } from "@/lib/provider-management/data";
import { getPublicLocations } from "@/lib/services/public-data";
import { updateProviderFleetAction } from "../../../actions";

export const metadata: Metadata = { title: "Edit Armada Provider" };

type EditProviderFleetPageProps = { readonly params: Promise<{ readonly fleet: string }> };

export default async function EditProviderFleetPage({ params }: EditProviderFleetPageProps): Promise<ReactElement> {
  const [{ fleet: fleetId }, session] = await Promise.all([params, requireRoleSession([UserRole.PROVIDER])]);
  const [t, fleet, locations] = await Promise.all([getTranslations("Partner.provider.fleet"), getProviderFleetById(session.userId, fleetId), getPublicLocations()]);
  if (!fleet) notFound();

  return (
    <div className="flex flex-col gap-5">
      <section className="hidden max-w-3xl md:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--charcoal)] md:text-3xl">{t("form.editTitle")}</h1>
      </section>
      <ProviderFleetForm action={updateProviderFleetAction} fleet={fleet} locations={locations} text={{ vehicleName: t("form.vehicleName"), vehicleType: t("form.vehicleType"), plateNumber: t("form.plateNumber"), capacity: t("form.capacity"), baseCity: t("form.baseCity"), basePrice: t("form.basePrice"), status: t("form.status"), notes: t("form.notes"), submit: t("form.submitUpdate"), cancel: t("form.cancel"), statusLabels: { AVAILABLE: t("statuses.AVAILABLE"), ASSIGNED: t("statuses.ASSIGNED"), MAINTENANCE: t("statuses.MAINTENANCE") } }} />
    </div>
  );
}
