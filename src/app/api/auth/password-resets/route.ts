import { OtpPurpose } from "@prisma/client";
import { createAndSendOtp } from "@/lib/auth/otp";
import { getPrismaClient } from "@/lib/db/prisma";
import { validationProblem } from "@/lib/http/problem";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

const GENERIC_RESPONSE = {
  accepted: true,
  message: "If the email exists, password reset instructions will be sent.",
} as const;

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("A valid email is required.");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return Response.json(GENERIC_RESPONSE);
  }

  await createAndSendOtp({
    userId: user.id,
    email: user.email,
    name: user.name,
    purpose: OtpPurpose.PASSWORD_RESET,
  }).catch(() => undefined);

  return Response.json(GENERIC_RESPONSE);
}
