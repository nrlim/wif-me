import "server-only";

import { PaymentStatus, ServiceType, UserRole, VerificationStatus, WithdrawalStatus, FinanceRuleKind, type Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";

export type ServiceCategoryRow = {
  readonly id: string;
  readonly key: string;
  readonly slug: string;
  readonly serviceType: ServiceType;
  readonly title: string;
  readonly description: string;
  readonly priceModel: string;
  readonly order: number;
  readonly status: "ACTIVE" | "DRAFT";
  readonly serviceCount: number;
  readonly providerCount: number;
  readonly activeCount: number;
};

export type ServiceItemRow = {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly type: ServiceType;
  readonly categoryKey: string | null;
  readonly categoryTitle: string | null;
  readonly ownerName: string;
  readonly basePrice: string;
  readonly basePriceIdr?: number;
  readonly baseCurrency: import("@prisma/client").CurrencyCode | null;
  readonly originalPrice: number | null;
  readonly isActive: boolean;
  readonly status: "active" | "draft";
  readonly baseLocationId: string | null;
};

export type PartnerListRow = {
  readonly id: string;
  readonly name: string;
  readonly type: "personal" | "provider";
  readonly serviceKey: ServiceType;
  readonly city: string;
  readonly bookings: number;
  readonly status: VerificationStatus;
};

export type TransactionListRow = {
  readonly id: string;
  readonly paymentId: string;
  readonly orderId: string;
  readonly serviceKey: ServiceType | "MULTIPLE";
  readonly customerName: string;
  readonly amount: string;
  readonly status: PaymentStatus;
  readonly proofUrl: string | null;
  readonly proofFileName: string | null;
  readonly proofMimeType: string | null;
  readonly proofUploadedAt: string | null;
  readonly proofRejectedAt: string | null;
  readonly proofReviewNote: string | null;
};

export type WithdrawalListRow = {
  readonly id: string;
  readonly partnerName: string;
  readonly amount: string;
  readonly status: WithdrawalStatus;
};

export type FinanceRuleRow = {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly value: string;
  readonly status: "ACTIVE" | "DRAFT";
};

export async function getAdminOverviewData(): Promise<{ readonly serviceCount: number; readonly partnerCount: number; readonly escrowBalance: string; readonly reviewCount: number }> {
  const prisma = getPrismaClient();
  const [serviceCount, partnerCount, escrow, reviewCount] = await Promise.all([
    prisma.serviceOffering.count(),
    prisma.user.count({ where: { role: { in: [UserRole.MUTHAWIF, UserRole.PROVIDER] } } }),
    prisma.payment.aggregate({ _sum: { amountIdr: true }, where: { status: PaymentStatus.HELD_IN_ESCROW } }),
    prisma.providerProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
  ]);

  return { serviceCount, partnerCount, escrowBalance: formatIdr(escrow._sum.amountIdr), reviewCount };
}

export async function getAdminQueueData(): Promise<{ readonly muthawif: number; readonly provider: number; readonly escrow: number }> {
  const prisma = getPrismaClient();
  const [muthawif, provider, escrow] = await Promise.all([
    prisma.providerProfile.count({ where: { verificationStatus: VerificationStatus.PENDING, user: { role: UserRole.MUTHAWIF } } }),
    prisma.providerProfile.count({ where: { verificationStatus: VerificationStatus.PENDING, user: { role: UserRole.PROVIDER } } }),
    prisma.payment.count({ where: { status: PaymentStatus.HELD_IN_ESCROW } }),
  ]);
  return { muthawif, provider, escrow };
}

export type TrendDataPoint = {
  readonly name: string;
  readonly value: number;
};

export type ServiceDistributionDataPoint = {
  readonly name: string;
  readonly value: number;
  readonly fill: string;
};

export async function getAdminChartData(period: "weekly" | "monthly" = "weekly"): Promise<{ readonly trend: readonly TrendDataPoint[]; readonly distribution: readonly ServiceDistributionDataPoint[] }> {
  const prisma = getPrismaClient();
  
  // Real distribution from DB
  const categories = await prisma.serviceCategory.findMany({ include: { offerings: true } });
  
  const colors = ["#1B6B4A", "#C4973B", "#334155", "#27956A", "#E4B55A"]; // emerald, gold, slate-700, emerald-light, gold-light
  
  const distribution = categories.map((cat, idx) => ({
    name: cat.title,
    value: cat.offerings.length,
    fill: colors[idx % colors.length]
  })).filter(d => d.value > 0);

  const daysToFetch = period === "monthly" ? 30 : 7;
  
  const recentPayments = await prisma.payment.findMany({
    where: { createdAt: { gte: new Date(Date.now() - daysToFetch * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true }
  });

  let trend: TrendDataPoint[] = [];
  const hasData = recentPayments.length > 0;

  if (period === "weekly") {
    const daysCount = new Map<string, number>();
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      daysCount.set(d.toLocaleDateString('id-ID', { weekday: 'short' }), 0);
    }

    for (const p of recentPayments) {
      const day = p.createdAt.toLocaleDateString('id-ID', { weekday: 'short' });
      if (daysCount.has(day)) {
        daysCount.set(day, (daysCount.get(day) ?? 0) + 1);
      }
    }

    trend = Array.from(daysCount.entries()).map(([name, value], idx) => ({
      name,
      value: hasData ? value : [2, 5, 3, 8, 4, 10, 6][idx]
    }));
  } else {
    // Monthly: split into 4 weeks
    const weeksCount = new Map<string, number>([
      ["Pekan 1", 0],
      ["Pekan 2", 0],
      ["Pekan 3", 0],
      ["Pekan 4", 0]
    ]);
    
    const todayMs = Date.now();
    for (const p of recentPayments) {
      const diffDays = Math.floor((todayMs - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      let weekKey = "Pekan 4";
      if (diffDays < 7) weekKey = "Pekan 4";
      else if (diffDays < 14) weekKey = "Pekan 3";
      else if (diffDays < 21) weekKey = "Pekan 2";
      else weekKey = "Pekan 1";
      
      weeksCount.set(weekKey, (weeksCount.get(weekKey) ?? 0) + 1);
    }
    
    trend = Array.from(weeksCount.entries()).map(([name, value], idx) => ({
      name,
      value: hasData ? value : [15, 24, 18, 30][idx]
    }));
  }

  return { trend, distribution };
}

export async function getServiceCategoryRows(): Promise<readonly ServiceCategoryRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.serviceCategory.findMany({ include: { offerings: true }, orderBy: { displayOrder: "asc" } });
  return rows.map((row) => toServiceCategoryRow(row));
}

export async function getServiceCategoryByKey(key: string): Promise<ServiceCategoryRow | null> {
  const prisma = getPrismaClient();
  const row = await prisma.serviceCategory.findUnique({ where: { key }, include: { offerings: true } });
  return row ? toServiceCategoryRow(row) : null;
}

function toServiceCategoryRow(row: Prisma.ServiceCategoryGetPayload<{ include: { offerings: true } }>): ServiceCategoryRow {
  return {
    id: row.id,
    key: row.key,
    slug: row.slug,
    serviceType: row.serviceType,
    title: row.title,
    description: row.description,
    priceModel: row.priceModel,
    order: row.displayOrder,
    status: row.status,
    serviceCount: row.offerings.length,
    providerCount: new Set(row.offerings.map((offering) => offering.ownerId)).size,
    activeCount: row.offerings.filter((offering) => offering.isActive).length,
  };
}

export async function getServiceItems(): Promise<readonly ServiceItemRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.serviceOffering.findMany({ orderBy: { createdAt: "desc" }, include: { owner: true, category: true } });
  return rows.map((row, index) => toServiceItemRow(row, index));
}

export async function getServiceItemById(id: string): Promise<ServiceItemRow | null> {
  const prisma = getPrismaClient();
  const row = await prisma.serviceOffering.findUnique({ where: { id }, include: { owner: true, category: true } });
  return row ? toServiceItemRow(row, 0) : null;
}

function toServiceItemRow(row: Prisma.ServiceOfferingGetPayload<{ include: { owner: true; category: true } }>, index: number): ServiceItemRow {
  return { id: row.id, code: `SRV-${String(index + 1).padStart(3, "0")}`, title: row.title, description: row.description, type: row.type, categoryKey: row.category?.key ?? null, categoryTitle: row.category?.title ?? null, ownerName: row.owner.name, basePrice: formatIdr(row.basePriceIdr), basePriceIdr: Number(row.basePriceIdr), baseCurrency: row.baseCurrency ?? null, originalPrice: row.originalPrice ? Number(row.originalPrice) : null, isActive: row.isActive, status: row.isActive ? "active" : "draft", baseLocationId: row.baseLocationId };
}

export async function getPartners(type: "personal" | "provider"): Promise<readonly PartnerListRow[]> {
  const prisma = getPrismaClient();
  const role = type === "personal" ? UserRole.MUTHAWIF : UserRole.PROVIDER;
  const rows = await prisma.user.findMany({ where: { role }, include: { providerProfile: { include: { baseLocation: true } }, offeredServices: { include: { bookings: true } } }, orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({ id: row.id, name: row.providerProfile?.displayName ?? row.name, type, serviceKey: row.offeredServices[0]?.type ?? (type === "personal" ? ServiceType.MUTHAWIF_PERSONAL : ServiceType.PROVIDER_MUTHAWIF), city: row.providerProfile?.baseLocation?.name ?? "-", bookings: row.offeredServices.reduce((total, service) => total + service.bookings.length, 0), status: row.providerProfile?.verificationStatus ?? VerificationStatus.DRAFT }));
}

export async function getTransactions(): Promise<readonly TransactionListRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.payment.findMany({ include: { order: { include: { customer: true, bookings: { include: { serviceOffering: true } } } } }, orderBy: { createdAt: "desc" } });
  return rows.map((row) => {
    const serviceKey = row.order.bookings.length > 1 ? "MULTIPLE" : row.order.bookings[0]?.serviceOffering.type;
    return { id: row.gatewayReference ?? row.id, paymentId: row.id, orderId: row.orderId, serviceKey, customerName: row.order.customer.name, amount: formatIdr(row.amountIdr), status: row.status, proofUrl: row.proofUrl, proofFileName: row.proofFileName, proofMimeType: row.proofMimeType, proofUploadedAt: row.proofUploadedAt?.toISOString() ?? null, proofRejectedAt: row.proofRejectedAt?.toISOString() ?? null, proofReviewNote: row.proofReviewNote };
  });
}

export async function getTransactionByReference(reference: string): Promise<TransactionListRow | null> {
  const rows = await getTransactions();
  return rows.find((row) => row.id === reference || row.orderId === reference) ?? null;
}

export async function getEscrows(): Promise<readonly TransactionListRow[]> {
  const rows = await getTransactions();
  const escrowStatuses: readonly PaymentStatus[] = [PaymentStatus.HELD_IN_ESCROW, PaymentStatus.RELEASED, PaymentStatus.REFUNDED];
  return rows.filter((row) => escrowStatuses.includes(row.status));
}

export async function getWithdrawals(): Promise<readonly WithdrawalListRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.withdrawalRequest.findMany({ include: { provider: true }, orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({ id: row.id, partnerName: row.provider.name, amount: formatIdr(row.amountIdr), status: row.status }));
}

export async function getWithdrawalById(id: string): Promise<WithdrawalListRow | null> {
  const rows = await getWithdrawals();
  return rows.find((row) => row.id === id) ?? null;
}

export async function getFinanceRules(kind: FinanceRuleKind): Promise<readonly FinanceRuleRow[]> {
  const prisma = getPrismaClient();
  const rows = await prisma.financeRule.findMany({ where: { kind }, orderBy: { createdAt: "asc" } });
  return rows.map((row) => ({ key: row.key, title: row.title, description: row.description, value: row.value, status: row.status }));
}

export async function getFinanceRule(kind: FinanceRuleKind, key: string): Promise<FinanceRuleRow | null> {
  const rows = await getFinanceRules(kind);
  return rows.find((row) => row.key === key) ?? null;
}

export function formatIdr(value: Prisma.Decimal | number | null | undefined): string {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(numeric);
}

export type ProviderDetail = Prisma.ProviderProfileGetPayload<{ include: { user: true; baseLocation: true } }>;

export async function getProviderDetail(id: string): Promise<ProviderDetail | null> {
  const prisma = getPrismaClient();
  // Here `id` could be the user ID, since the admin partner list uses `row.id` (which is User ID)
  return await prisma.providerProfile.findUnique({
    where: { userId: id },
    include: { user: true, baseLocation: true }
  });
}
