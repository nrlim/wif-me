import { UserRole } from "@prisma/client";
import { requireRoleSession } from "@/lib/auth/current-session";
import { uploadProviderLogo } from "@/lib/storage/supabase";
import { serverProblem, validationProblem } from "@/lib/http/problem";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let session;
  try {
    session = await requireRoleSession([UserRole.PROVIDER]);
  } catch {
    return new Response(JSON.stringify({ detail: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file || !(file instanceof File)) {
      return validationProblem("Logo file is required.");
    }

    if (!file.type.startsWith("image/")) {
      return validationProblem("File must be an image.");
    }

    // Maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      return validationProblem("File size must not exceed 5MB.");
    }

    const path = await uploadProviderLogo(session.userId, file);

    return Response.json({ path }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return serverProblem();
  }
}
