import { OtpPurpose, UserRole } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { createAndSendOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/security/password";
import { conflictProblem, problemResponse, serverProblem, validationProblem } from "@/lib/http/problem";
import { acceptInviteSchema } from "@/lib/validators/invite";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = acceptInviteSchema.safeParse(body);

  if (!parsed.success) {
    return validationProblem("Name and password (min 8 chars with letters and numbers) are required.");
  }

  const prisma = getPrismaClient();

  // Find the invitation by token
  const staffRecord = await prisma.providerStaff.findFirst({
    where: { inviteToken: parsed.data.token },
    select: {
      id: true,
      email: true,
      name: true,
      inviteStatus: true,
      inviteExpiresAt: true,
      userId: true,
      provider: { select: { name: true, providerProfile: { select: { displayName: true } } } },
    },
  });

  if (!staffRecord || !staffRecord.email) {
    return problemResponse({
      type: "https://wifme.id/problems/invite-not-found",
      title: "Invitation Not Found",
      status: 404,
      detail: "Invitation link is invalid or has been revoked.",
    });
  }

  // Guard: already accepted
  if (staffRecord.inviteStatus !== "PENDING") {
    return problemResponse({
      type: "https://wifme.id/problems/invite-already-used",
      title: "Invitation Already Used",
      status: 410,
      detail: "This invitation has already been accepted.",
    });
  }

  // Guard: expired
  if (!staffRecord.inviteExpiresAt || staffRecord.inviteExpiresAt.getTime() < Date.now()) {
    return problemResponse({
      type: "https://wifme.id/problems/invite-expired",
      title: "Invitation Expired",
      status: 410,
      detail: "This invitation link has expired. Ask the provider to send a new one.",
    });
  }

  // Guard: email already registered as user
  const existingUser = await prisma.user.findUnique({
    where: { email: staffRecord.email },
    select: { id: true },
  });

  if (existingUser) {
    // Link the existing user to this staff record
    await prisma.providerStaff.update({
      where: { id: staffRecord.id },
      data: { userId: existingUser.id, inviteStatus: "ACCEPTED", inviteToken: null },
    });

    return conflictProblem("Email is already registered. Your account has been linked to this provider.");
  }

  try {
    // Create user and link to staff in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: staffRecord.email!,
          name: parsed.data.name,
          role: UserRole.MUTHAWIF,
          passwordHash: hashPassword(parsed.data.password),
        },
        select: { id: true, email: true, name: true },
      });

      await tx.providerStaff.update({
        where: { id: staffRecord.id },
        data: {
          userId: newUser.id,
          inviteStatus: "ACCEPTED",
          inviteToken: null,
        },
      });

      return newUser;
    });

    // Send OTP for email verification
    await createAndSendOtp({
      userId: user.id,
      email: user.email,
      name: user.name,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
    });

    return Response.json(
      { id: user.id, email: user.email, emailVerificationRequired: true },
      { status: 201 }
    );
  } catch {
    return serverProblem();
  }
}
