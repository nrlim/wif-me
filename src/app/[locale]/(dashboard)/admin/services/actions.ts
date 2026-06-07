"use server";

import { redirect } from "@/i18n/routing";
import { deleteServiceResourceSchema, serviceCategoryMutationSchema, serviceItemMutationSchema } from "@/lib/validators/services";

function readLocale(formData: FormData): string {
  const value = formData.get("locale");
  return typeof value === "string" && value.length > 0 ? value : "id";
}

export async function saveServiceCategory(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  serviceCategoryMutationSchema.parse({
    key: formData.get("key"),
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    priceModelKey: formData.get("priceModelKey"),
    order: formData.get("order"),
    status: formData.get("status"),
  });

  return redirect({ href: "/admin/services/categories?notice=saved", locale });
}

export async function deleteServiceCategory(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  deleteServiceResourceSchema.parse({ id: formData.get("id") });

  return redirect({ href: "/admin/services/categories?notice=deleted", locale });
}

export async function saveServiceItem(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  serviceItemMutationSchema.parse({
    key: formData.get("key"),
    categoryKey: formData.get("categoryKey"),
    code: formData.get("code"),
    title: formData.get("title"),
    description: formData.get("description"),
    basePriceIdr: formData.get("basePriceIdr"),
    durationKey: formData.get("durationKey"),
    status: formData.get("status"),
  });

  return redirect({ href: "/admin/services/items?notice=saved", locale });
}

export async function deleteServiceItem(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  deleteServiceResourceSchema.parse({ id: formData.get("id") });

  return redirect({ href: "/admin/services/items?notice=deleted", locale });
}
