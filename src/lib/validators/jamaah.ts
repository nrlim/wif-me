import { BookingStatus, PaymentStatus, ServiceType } from "@prisma/client";
import { z } from "zod";

const perPageSchema = z.coerce.number().int().refine((value) => [10, 20, 50].includes(value)).default(10);
const pageSchema = z.coerce.number().int().min(1).default(1);

export const serviceSearchQuerySchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  serviceType: z.enum(ServiceType).optional().catch(undefined),
  page: pageSchema.catch(1),
  perPage: perPageSchema.catch(10),
  sort: z.enum(["latest", "price", "title"]).default("latest").catch("latest"),
  order: z.enum(["asc", "desc"]).default("desc").catch("desc"),
  locationId: z.string().uuid().optional().catch(undefined),
});

export const bookingListQuerySchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  status: z.enum(BookingStatus).optional().catch(undefined),
  page: pageSchema.catch(1),
  perPage: perPageSchema.catch(10),
  sort: z.enum(["latest", "schedule", "price"]).default("latest").catch("latest"),
  order: z.enum(["asc", "desc"]).default("desc").catch("desc"),
});

export const paymentListQuerySchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  status: z.enum(PaymentStatus).optional().catch(undefined),
  page: pageSchema.catch(1),
  perPage: perPageSchema.catch(10),
  sort: z.enum(["latest", "amount"]).default("latest").catch("latest"),
  order: z.enum(["asc", "desc"]).default("desc").catch("desc"),
});

const uuidPattern = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}";
const providerResourceIdSchema = z.string().regex(new RegExp(`^(staff|fleet):${uuidPattern}$`));

export const createOrderSchema = z.object({
  items: z.array(z.object({
    serviceId: z.union([z.uuid(), providerResourceIdSchema]),
    scheduledStart: z.iso.date(),
    quantity: z.number().int().min(1).max(50).default(1),
    notes: z.string().trim().max(800).optional(),
  })).min(1),
  voucherCode: z.string().trim().optional(),
});

export const paymentIdSchema = z.object({
  paymentId: z.uuid(),
});

export const paymentProofSchema = z.object({
  paymentId: z.uuid(),
});

export const jamaahProfileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(32).optional(),
});

export const jamaahPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/[0-9]/),
  confirmPassword: z.string().min(8).max(128),
}).refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"] });

export type ServiceSearchQuery = z.infer<typeof serviceSearchQuerySchema>;
export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
