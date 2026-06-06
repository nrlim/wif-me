import { OtpPurpose } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { createAndSendOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/security/password";
import { conflictProblem, serverProblem, validationProblem } from "@/lib/http/problem";
import { registerSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

type RegisterResponse = {
  readonly id: string;
  readonly email: string;
  readonly emailVerificationRequired: true;
};

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("Name, valid email, role, and password with letters and numbers are required.");
  }

  const prisma = getPrismaClient();
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return conflictProblem("Email is already registered.");
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role,
        passwordHash: hashPassword(parsed.data.password),
      },
      select: { id: true, email: true, name: true },
    });

    await createAndSendOtp({
      userId: user.id,
      email: user.email,
      name: user.name,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
    });

    return Response.json(
      { id: user.id, email: user.email, emailVerificationRequired: true } satisfies RegisterResponse,
      { status: 201 }
    );
  } catch {
    return serverProblem();
  }
}
