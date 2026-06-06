import { OtpPurpose } from "@prisma/client";
import { verifyOtp } from "@/lib/auth/otp";
import { getPrismaClient } from "@/lib/db/prisma";
import { problemResponse, serverProblem, validationProblem } from "@/lib/http/problem";
import { hashPassword } from "@/lib/security/password";
import { resetPasswordSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("Valid email, 6 digit OTP, and a stronger new password are required.");
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (!user) {
    return problemResponse({
      type: "https://wifme.id/problems/invalid-otp",
      title: "Invalid OTP",
      status: 400,
      detail: "The password reset code is invalid or expired.",
    });
  }

  const result = await verifyOtp({
    userId: user.id,
    otp: parsed.data.otp,
    purpose: OtpPurpose.PASSWORD_RESET,
  });

  if (result !== "valid") {
    return problemResponse({
      type: "https://wifme.id/problems/invalid-otp",
      title: "Invalid OTP",
      status: 400,
      detail: "The password reset code is invalid or expired.",
    });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(parsed.data.password) },
    });

    return Response.json({ passwordUpdated: true });
  } catch {
    return serverProblem();
  }
}
