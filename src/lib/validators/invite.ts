import { z } from "zod";

export const acceptInviteSchema = z.object({
  token: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  password: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/[0-9]/),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
