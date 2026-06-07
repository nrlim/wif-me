"use server";

import { redirect } from "@/i18n/routing";
import { deletePartnerSchema, partnerMutationSchema } from "@/lib/validators/partners";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

function listPath(type: "personal" | "provider", notice: "saved" | "deleted"): "/admin/partners/muthawif?notice=saved" | "/admin/partners/providers?notice=saved" | "/admin/partners/muthawif?notice=deleted" | "/admin/partners/providers?notice=deleted" {
  if (type === "personal") return notice === "saved" ? "/admin/partners/muthawif?notice=saved" : "/admin/partners/muthawif?notice=deleted";
  return notice === "saved" ? "/admin/partners/providers?notice=saved" : "/admin/partners/providers?notice=deleted";
}

export async function savePartner(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  const parsed = partnerMutationSchema.parse({
    key: formData.get("key"),
    type: formData.get("type"),
    name: formData.get("name"),
    serviceKey: formData.get("serviceKey"),
    cityKey: formData.get("cityKey"),
    bookings: formData.get("bookings"),
    status: formData.get("status"),
  });

  return redirect({ href: listPath(parsed.type, "saved"), locale });
}

export async function deletePartner(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  const parsed = deletePartnerSchema.parse({ id: formData.get("id"), type: formData.get("type") });

  return redirect({ href: listPath(parsed.type, "deleted"), locale });
}
