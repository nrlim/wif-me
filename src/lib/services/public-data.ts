import "server-only";

import { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/currency/formatters";
import { FALLBACK_RATES } from "@/lib/currency/rates";

export type PublicOfferingRow = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly ownerName: string;
  readonly basePrice: string;
  readonly routeLabel: string | null;
};

export type PublicCategoryDetail = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly offerings: readonly PublicOfferingRow[];
  readonly providerCount: number;
};

const publicOfferingSelect = {
  id: true,
  title: true,
  description: true,
  basePriceIdr: true,
  routeFrom: true,
  routeTo: true,
  owner: { select: { name: true, providerProfile: { select: { displayName: true } } } },
} as const satisfies Prisma.ServiceOfferingSelect;

export async function getPublicCategoryDetail(slug: string): Promise<PublicCategoryDetail | null> {
  const prisma = getPrismaClient();
  const category = await prisma.serviceCategory.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      slug: true,
      title: true,
      description: true,
      offerings: { where: { isActive: true }, select: publicOfferingSelect, orderBy: { createdAt: "desc" } },
    },
  });

  if (!category) return null;

  const providerNames = new Set(category.offerings.map((offering) => offering.owner.providerProfile?.displayName ?? offering.owner.name));

  return {
    slug: category.slug,
    title: category.title,
    description: category.description,
    offerings: category.offerings.map(toPublicOfferingRow),
    providerCount: providerNames.size,
  };
}

function toPublicOfferingRow(offering: Prisma.ServiceOfferingGetPayload<{ select: typeof publicOfferingSelect }>): PublicOfferingRow {
  return {
    id: offering.id,
    title: offering.title,
    description: offering.description,
    ownerName: offering.owner.providerProfile?.displayName ?? offering.owner.name,
    basePrice: formatCurrency(Number(offering.basePriceIdr), "IDR", FALLBACK_RATES),
    routeLabel: offering.routeFrom && offering.routeTo ? `${offering.routeFrom} → ${offering.routeTo}` : null,
  };
}
