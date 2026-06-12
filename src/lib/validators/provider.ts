import { z } from "zod";

export const providerProfileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  displayName: z.string().trim().min(2).max(180),
  companyName: z.string().trim().min(2).max(200),
  companyType: z.string().trim().min(2).max(80),
  registrationNumber: z.string().trim().max(80).optional(),
  taxId: z.string().trim().max(40).optional(),
  phone: z.string().trim().max(32).optional(),
  whatsapp: z.string().trim().max(32).optional(),
  website: z.string().trim().max(255).optional(),
  address: z.string().trim().max(800).optional(),
  baseLocationId: z.string().uuid().optional().or(z.literal("")),
  country: z.string().trim().min(2).max(4),
  languages: z.string().trim().max(240).optional(),
  bio: z.string().trim().max(800).optional(),
});

export const providerPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/[0-9]/),
  confirmPassword: z.string().min(8).max(128),
}).refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"] });

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
