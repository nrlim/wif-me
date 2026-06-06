import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

type HealthResponse = {
  readonly status: "ok" | "unavailable";
};

export async function GET(): Promise<Response> {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({ status: "ok" } satisfies HealthResponse, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { status: "unavailable" } satisfies HealthResponse,
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
