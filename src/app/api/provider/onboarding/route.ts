import { ServiceType, UserRole } from "@prisma/client";
import { requireRoleSession } from "@/lib/auth/current-session";
import { getPrismaClient } from "@/lib/db/prisma";
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
    
    const companyName = formData.get("companyName") as string;
    const companyType = formData.get("companyType") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const taxId = formData.get("taxId") as string;
    const phone = formData.get("phone") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const website = formData.get("website") as string;
    const address = formData.get("address") as string;
    const baseCity = formData.get("baseCity") as string;
    const country = formData.get("country") as string;
    const logoUrl = formData.get("logoUrl") as string;
    
    const servicesRaw = formData.get("services") as string;
    const languagesRaw = formData.get("languages") as string;
    
    if (!companyName || !phone || !whatsapp || !baseCity) {
      return validationProblem("Lengkapi semua field wajib.");
    }

    const prisma = getPrismaClient();
    
    const serviceTypes = parseServiceTypes(servicesRaw);
    const languages = languagesRaw ? languagesRaw.split(",").filter(Boolean) : ["Indonesia"];

    await prisma.providerProfile.upsert({
      where: { userId: session.userId },
      update: {
        companyName,
        companyType,
        registrationNumber: registrationNumber || null,
        taxId: taxId || null,
        phone,
        whatsapp,
        website: website || null,
        address,
        baseLocationId: undefined,
        country,
        logoUrl: logoUrl || null,
        serviceTypes,
        languages,
        verificationStatus: "PENDING",
        submittedAt: new Date(),
      },
      create: {
        userId: session.userId,
        companyName,
        displayName: companyName, // Default to company name
        companyType,
        registrationNumber: registrationNumber || null,
        taxId: taxId || null,
        phone,
        whatsapp,
        website: website || null,
        address,
        baseLocationId: undefined,
        country,
        logoUrl: logoUrl || null,
        serviceTypes,
        languages,
        verificationStatus: "PENDING",
        submittedAt: new Date(),
      }
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return serverProblem();
  }
}

function parseServiceTypes(value: string): ServiceType[] {
  const allowedTypes = new Set<string>(Object.values(ServiceType));
  return value.split(",").filter((item): item is ServiceType => allowedTypes.has(item));
}
