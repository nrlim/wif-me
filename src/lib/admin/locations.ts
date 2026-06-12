import "server-only";

import { LocationType, Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import type { LocationListQuery } from "@/lib/validators/locations";

export type AdminLocationRow = {
  readonly id: string;
  readonly name: string;
  readonly type: LocationType;
  readonly countryCode: string;
  readonly isMaster: boolean;
  readonly createdAt: Date;
  readonly serviceCount: number;
  readonly providerCount: number;
};

export type AdminLocationList = {
  readonly rows: readonly AdminLocationRow[];
  readonly total: number;
  readonly page: number;
  readonly perPage: number;
  readonly pageCount: number;
};

type LocationWithCounts = Prisma.LocationGetPayload<{
  include: {
    _count: {
      select: {
        serviceBases: true;
        serviceOrigins: true;
        serviceDestinations: true;
        providerProfiles: true;
        providerFleets: true;
      };
    };
  };
}>;

export async function getAdminLocationList(query: LocationListQuery): Promise<AdminLocationList> {
  const prisma = getPrismaClient();
  const where = buildLocationWhere(query);
  const orderBy = buildLocationOrderBy(query);
  const skip = (query.page - 1) * query.perPage;

  const [rows, total] = await Promise.all([
    prisma.location.findMany({
      where,
      orderBy,
      skip,
      take: query.perPage,
      include: {
        _count: {
          select: {
            serviceBases: true,
            serviceOrigins: true,
            serviceDestinations: true,
            providerProfiles: true,
            providerFleets: true,
          },
        },
      },
    }),
    prisma.location.count({ where }),
  ]);

  return {
    rows: rows.map(toAdminLocationRow),
    total,
    page: query.page,
    perPage: query.perPage,
    pageCount: Math.max(1, Math.ceil(total / query.perPage)),
  };
}

export async function getAdminLocationById(id: string): Promise<AdminLocationRow | null> {
  const prisma = getPrismaClient();
  const row = await prisma.location.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          serviceBases: true,
          serviceOrigins: true,
          serviceDestinations: true,
          providerProfiles: true,
          providerFleets: true,
        },
      },
    },
  });

  return row ? toAdminLocationRow(row) : null;
}

function buildLocationWhere(query: LocationListQuery): Prisma.LocationWhereInput {
  const where: Prisma.LocationWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { countryCode: { contains: query.q, mode: "insensitive" } },
    ];
  }

  if (query.type) where.type = query.type;
  if (query.countryCode) where.countryCode = query.countryCode;
  if (query.isMaster === "master") where.isMaster = true;
  if (query.isMaster === "custom") where.isMaster = false;

  return where;
}

function buildLocationOrderBy(query: LocationListQuery): Prisma.LocationOrderByWithRelationInput {
  const direction = query.order;
  if (query.sort === "latest") return { createdAt: direction };
  if (query.sort === "type") return { type: direction };
  if (query.sort === "countryCode") return { countryCode: direction };
  return { name: direction };
}

function toAdminLocationRow(row: LocationWithCounts): AdminLocationRow {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    countryCode: row.countryCode,
    isMaster: row.isMaster,
    createdAt: row.createdAt,
    serviceCount: row._count.serviceBases + row._count.serviceOrigins + row._count.serviceDestinations,
    providerCount: row._count.providerProfiles + row._count.providerFleets,
  };
}
