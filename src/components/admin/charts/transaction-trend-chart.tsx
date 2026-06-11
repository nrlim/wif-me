"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendDataPoint } from "@/lib/admin/data";

type Props = {
  readonly data: readonly TrendDataPoint[];
};

export function TransactionTrendChart({ data }: Props) {
  const t = useTranslations("Dashboard.charts");

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B6B4A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1B6B4A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#64748B" }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#64748B" }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}
            itemStyle={{ color: '#1B6B4A', fontSize: '14px', fontWeight: 'bold' }}
            formatter={(value: unknown) => [String(value ?? 0), t("transactions")]}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#1B6B4A" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEmerald)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
