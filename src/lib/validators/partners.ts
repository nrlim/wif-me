import { z } from "zod";

export const partnerMutationSchema = z.object({
  key: z.string().trim().min(3).max(80),
  type: z.enum(["personal", "provider"]),
  name: z.string().trim().min(3).max(160),
  serviceKey: z.enum(["muthawifPersonal", "providerMuthawif", "transportation"]),
  baseLocationId: z.string().uuid().optional().or(z.literal("")),
  bookings: z.coerce.number().int().min(0).max(99999),
  status: z.enum(["verified", "review", "paused"]),
});

export const deletePartnerSchema = z.object({
  id: z.string().trim().min(2).max(120),
  type: z.enum(["personal", "provider"]),
});

export const partnerVerificationActionSchema = z.object({
  partnerId: z.string().uuid(),
  partnerType: z.enum(["personal", "provider"]),
  rejectionReason: z.string().trim().max(500).optional(),
});

export type PartnerMutationInput = z.infer<typeof partnerMutationSchema>;
export type PartnerVerificationActionInput = z.infer<typeof partnerVerificationActionSchema>;
