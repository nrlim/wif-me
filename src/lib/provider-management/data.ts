import "server-only";

import { ProviderFleetStatus, ProviderStaffStatus, Prisma, type ProviderStaff } from "@prisma/client";
import { formatCurrency } from "@/lib/currency/formatters";
import { FALLBACK_RATES, type CurrencyCode } from "@/lib/currency/rates";
import { getPrismaClient } from "@/lib/db/prisma";

export type ProviderStaffRow = {
  readonly id: string;
  readonly name: string;
  readonly roleTitle: string;
  readonly phone: string;
  readonly languages: readonly string[];
  readonly basePrice: string;
  readonly basePriceIdr: number;
  readonly baseCurrency: CurrencyCode;
  readonly originalPrice: number;
  readonly status: ProviderStaffStatus;
  readonly email: string | null;
  readonly inviteStatus: "NONE" | "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  readonly inviteToken: string | null;
  readonly notes: string;
};

export type ProviderFleetRow = {
  readonly id: string;
  readonly vehicleName: string;
  readonly vehicleType: string;
  readonly plateNumber: string;
  readonly capacity: number;
  readonly baseCity: string;
  readonly baseLocationId: string | null;
  readonly basePrice: string;
  readonly basePriceIdr: number;
  readonly baseCurrency: CurrencyCode;
  readonly originalPrice: number;
  readonly status: ProviderFleetStatus;
  readonly notes: string;
};

export async function getProviderStaffRows(providerId: string): Promise<readonly ProviderStaffRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.providerStaff.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
  return rows.map(toStaffRow);
}

export async function getProviderStaffById(providerId: string, id: string): Promise<ProviderStaffRow | null> {
  const prisma = getPrismaClient();
  const row = await prisma.providerStaff.findFirst({ where: { id, providerId } });
  return row ? toStaffRow(row) : null;
}

export async function getProviderFleetRows(providerId: string): Promise<readonly ProviderFleetRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.providerFleet.findMany({ where: { providerId }, include: { baseLocation: true }, orderBy: { createdAt: "desc" } });
  return rows.map(toFleetRow);
}

export async function getProviderFleetById(providerId: string, id: string): Promise<ProviderFleetRow | null> {
  const prisma = getPrismaClient();
  const row = await prisma.providerFleet.findFirst({ where: { id, providerId }, include: { baseLocation: true } });
  return row ? toFleetRow(row) : null;
}

function toStaffRow(row: ProviderStaff): ProviderStaffRow {
  const basePriceIdr = toFiniteNumber(row.basePriceIdr);
  const originalPrice = row.originalPrice === null ? basePriceIdr : toFiniteNumber(row.originalPrice, basePriceIdr);

  return {
    id: row.id,
    name: row.name,
    roleTitle: row.roleTitle,
    phone: row.phone ?? "-",
    languages: row.languages,
    basePrice: formatCurrency(basePriceIdr, "IDR", FALLBACK_RATES),
    basePriceIdr,
    baseCurrency: row.baseCurrency,
    originalPrice,
    status: row.status,
    email: row.email,
    inviteStatus: row.inviteStatus as "NONE" | "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED",
    inviteToken: row.inviteStatus === "PENDING" ? row.inviteToken : null,
    notes: row.notes ?? "",
  };
}

function toFleetRow(row: Prisma.ProviderFleetGetPayload<{ include: { baseLocation: true } }>): ProviderFleetRow {
  const basePriceIdr = toFiniteNumber(row.basePriceIdr);
  const originalPrice = row.originalPrice === null ? basePriceIdr : toFiniteNumber(row.originalPrice, basePriceIdr);

  return {
    id: row.id,
    vehicleName: row.vehicleName,
    vehicleType: row.vehicleType,
    plateNumber: row.plateNumber ?? "-",
    capacity: row.capacity,
    baseCity: row.baseLocation?.name ?? "-",
    baseLocationId: row.baseLocationId,
    basePrice: formatCurrency(basePriceIdr, "IDR", FALLBACK_RATES),
    basePriceIdr,
    baseCurrency: row.baseCurrency,
    originalPrice,
    status: row.status,
    notes: row.notes ?? "",
  };
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export { ProviderFleetStatus, ProviderStaffStatus };
