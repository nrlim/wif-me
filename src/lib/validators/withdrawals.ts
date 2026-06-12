import { z } from "zod";

const optionalText = z.preprocess(
  (value: unknown) => (typeof value === "string" && value.trim().length > 0 ? value : undefined),
  z.string().trim().max(500).optional()
);

export const withdrawalRequestSchema = z.object({
  amountIdr: z.coerce.number().int().min(100_000).max(500_000_000),
  bankName: z.string().trim().min(2).max(120),
  bankAccountName: z.string().trim().min(2).max(160),
  bankAccountNumber: z.string().trim().regex(/^[0-9]{6,32}$/),
  requestedNote: optionalText,
});

export const withdrawalReviewSchema = z.object({
  withdrawalId: z.string().uuid(),
  reviewNote: optionalText,
});

export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type WithdrawalReviewInput = z.infer<typeof withdrawalReviewSchema>;
