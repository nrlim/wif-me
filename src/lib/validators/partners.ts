import { z } from "zod";

export const partnerMutationSchema = z.object({
  key: z.string().trim().min(3).max(80),
  type: z.enum(["personal", "provider"]),
  name: z.string().trim().min(3).max(160),
  serviceKey: z.enum(["muthawifPersonal", "providerMuthawif", "transportation"]),
  cityKey: z.enum(["makkah", "jeddah", "madinah"]),
  bookings: z.coerce.number().int().min(0).max(99999),
  status: z.enum(["verified", "review", "paused"]),
});

export const deletePartnerSchema = z.object({
  id: z.string().trim().min(2).max(120),
  type: z.enum(["personal", "provider"]),
});

export type PartnerMutationInput = z.infer<typeof partnerMutationSchema>;
