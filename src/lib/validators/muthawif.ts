import { z } from "zod";

export const muthawifProfileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(32).optional(),
  displayName: z.string().trim().min(2).max(180),
  baseCity: z.string().trim().max(120).optional(),
  languages: z.string().trim().max(240).optional(),
  bio: z.string().trim().max(800).optional(),
});

export const muthawifPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/[0-9]/),
  confirmPassword: z.string().min(8).max(128),
}).refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"] });
