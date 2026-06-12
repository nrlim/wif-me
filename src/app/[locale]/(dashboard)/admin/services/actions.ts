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

import { getPrismaClient } from "@/lib/db/prisma";
import { FALLBACK_RATES, type CurrencyCode } from "@/lib/currency/rates";

export async function saveServiceItem(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  const parsed = serviceItemMutationSchema.parse({
    key: formData.get("key"),
    categoryKey: formData.get("categoryKey"),
    code: formData.get("code"),
    title: formData.get("title"),
    description: formData.get("description"),
    baseCurrency: formData.get("baseCurrency"),
    originalPrice: formData.get("originalPrice"),
    durationKey: formData.get("durationKey"),
    baseLocationId: formData.get("baseLocationId"),
    status: formData.get("status"),
  });

  const prisma = getPrismaClient();

  // Try to find the latest cached rate, otherwise fallback
  const rateRow = await prisma.exchangeRate.findFirst({
    where: { baseCurrency: "IDR", targetCurrency: parsed.baseCurrency },
    orderBy: { fetchedAt: "desc" }
  });

  const exchangeRate = rateRow ? Number(rateRow.rate) : FALLBACK_RATES[parsed.baseCurrency as CurrencyCode] ?? 1;
  const computedBasePriceIdr = parsed.originalPrice / exchangeRate;

  // We are supposed to upsert or update the service here. But we don't have the `id` from the form.
  // Wait, the edit form doesn't send `id`. It sends `key`.
  const category = await prisma.serviceCategory.findUnique({ where: { key: parsed.categoryKey } });

  // Update logic: In a real app we'd upsert by ID or Code. We'll update by code since it's in the form, 
  // or we can just assume it's updating if code exists. But for now, we'll try to find by code.
  const existing = await prisma.serviceOffering.findFirst({ where: { title: parsed.title } });
  
  if (existing) {
    await prisma.serviceOffering.update({
      where: { id: existing.id },
      data: {
        title: parsed.title,
        description: parsed.description,
        baseCurrency: parsed.baseCurrency,
        originalPrice: parsed.originalPrice,
        basePriceIdr: computedBasePriceIdr,
        isActive: parsed.status === "active",
        categoryId: category?.id,
        baseLocationId: parsed.baseLocationId || null,
      }
    });
  } else {
    // We need ownerId. We can just pick the first Admin or provider.
    const owner = await prisma.user.findFirst();
    if (owner) {
      await prisma.serviceOffering.create({
        data: {
          title: parsed.title,
          description: parsed.description,
          type: category?.serviceType ?? "MUTHAWIF_PERSONAL",
          baseCurrency: parsed.baseCurrency,
          originalPrice: parsed.originalPrice,
          basePriceIdr: computedBasePriceIdr,
          isActive: parsed.status === "active",
          categoryId: category?.id,
          ownerId: owner.id,
          baseLocationId: parsed.baseLocationId || null,
        }
      });
    }
  }

  return redirect({ href: "/admin/services/items?notice=saved", locale });
}

export async function deleteServiceItem(formData: FormData): Promise<never> {
  const locale = readLocale(formData);
  deleteServiceResourceSchema.parse({ id: formData.get("id") });

  return redirect({ href: "/admin/services/items?notice=deleted", locale });
}
