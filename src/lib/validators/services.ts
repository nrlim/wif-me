import { z } from "zod";
const statusSchema = z.enum(["active", "draft"]);
const priceModelSchema = z.enum(["currency", "b2b", "route", "document", "custom"]);

export const serviceCategoryMutationSchema = z.object({
  key: z.string().trim().min(3).max(80),
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(12).max(500),
  priceModelKey: priceModelSchema,
  order: z.coerce.number().int().min(1).max(99),
  status: statusSchema,
});

export const serviceItemMutationSchema = z.object({
  key: z.string().trim().min(3).max(80),
  categoryKey: z.string().trim().min(2).max(80),
  code: z.string().trim().min(3).max(40),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(12).max(500),
  baseCurrency: z.enum(["IDR", "SAR", "USD"]),
  originalPrice: z.coerce.number().min(0).max(999_999_999),
  durationKey: z.string().trim().min(2).max(40),
  baseLocationId: z.string().uuid().optional().or(z.literal("")),
  status: statusSchema,
});

export const deleteServiceResourceSchema = z.object({
  id: z.string().trim().min(2).max(120),
});

export type ServiceCategoryMutationInput = z.infer<typeof serviceCategoryMutationSchema>;
export type ServiceItemMutationInput = z.infer<typeof serviceItemMutationSchema>;
