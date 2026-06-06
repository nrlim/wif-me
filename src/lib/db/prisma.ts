import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    ssl: connectionString.includes("supabase.")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export function getPrismaClient(): PrismaClient {
  globalForPrisma.prismaClient ??= createPrismaClient();

  return globalForPrisma.prismaClient;
}
