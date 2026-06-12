import { ProviderFleetStatus, ProviderStaffStatus } from "@prisma/client";
import { z } from "zod";

export const providerResourceIdSchema = z.object({
  id: z.uuid(),
});

const resourcePriceSchema = {
  baseCurrency: z.enum(["IDR", "SAR", "USD"]),
  originalPrice: z.coerce.number().min(0).max(999_999_999),
} as const;

export const providerStaffSchema = z.object({
  name: z.string().trim().min(2).max(160),
  roleTitle: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional(),
  languages: z.string().trim().max(240).optional(),
  ...resourcePriceSchema,
  status: z.enum(ProviderStaffStatus),
  notes: z.string().trim().max(800).optional(),
});

export const providerFleetSchema = z.object({
  vehicleName: z.string().trim().min(2).max(160),
  vehicleType: z.string().trim().min(2).max(80),
  plateNumber: z.string().trim().max(40).optional(),
  capacity: z.coerce.number().int().min(1).max(60),
  baseLocationId: z.string().uuid().optional().or(z.literal("")),
  ...resourcePriceSchema,
  status: z.enum(ProviderFleetStatus),
  notes: z.string().trim().max(800).optional(),
});

export type ProviderStaffInput = z.infer<typeof providerStaffSchema>;
export type ProviderFleetInput = z.infer<typeof providerFleetSchema>;
