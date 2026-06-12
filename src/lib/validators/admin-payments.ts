import { z } from "zod";

export const adminPaymentReviewSchema = z.object({
  paymentId: z.uuid(),
  reviewNote: z.string().trim().max(500).optional(),
});

export type AdminPaymentReviewInput = z.infer<typeof adminPaymentReviewSchema>;
