import { UserRole } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Za-z]/)
  .regex(/[0-9]/);

export const registerSchema = z.object({
  email: z.email().max(255).transform((email) => email.toLowerCase()),
  name: z.string().min(2).max(160),
  password: passwordSchema,
  role: z.enum([UserRole.JAMAAH, UserRole.MUTHAWIF, UserRole.PROVIDER]).default(UserRole.JAMAAH),
});

export const loginSchema = z.object({
  email: z.email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const emailOtpSchema = z.object({
  email: z.email().max(255).transform((email) => email.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/),
});

export const forgotPasswordSchema = z.object({
  email: z.email().max(255).transform((email) => email.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z.email().max(255).transform((email) => email.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/),
  password: passwordSchema,
});
