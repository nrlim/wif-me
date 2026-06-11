"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Label } from "recharts";
import type { ServiceDistributionDataPoint } from "@/lib/admin/data";
import { useMemo } from "react";

type Props = {
  readonly data: readonly ServiceDistributionDataPoint[];
};

export function ServiceDistributionChart({ data }: Props) {
  const t = useTranslations("Dashboard.charts");

  const total = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <div className="flex h-64 w-full flex-col sm:flex-row items-center justify-center gap-6 px-4">
      <div className="relative h-48 w-48 sm:h-full sm:w-1/2 shrink-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-[var(--charcoal)] text-3xl font-extrabold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
              formatter={(value: unknown) => [String(value ?? 0), t("services")]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex w-full sm:w-1/2 flex-col justify-center gap-3 border-t border-[var(--border)] pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span 
                className="size-3 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-sm font-bold text-[var(--charcoal)] transition-colors group-hover:text-[var(--emerald)]">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-extrabold text-[var(--text-muted)] transition-colors group-hover:text-[var(--charcoal)]">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
