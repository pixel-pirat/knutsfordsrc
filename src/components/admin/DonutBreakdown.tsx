"use client";

import { Pie, PieChart, Cell, Tooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

export type DonutSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
  secondaryLabel?: string;
};

function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: DonutSegment }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;

  return (
    <div className="rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">{d.label}</p>
      <p className="text-neutral-300">
        {d.value} &middot; {pct}%
      </p>
      {d.secondaryLabel && <p className="text-neutral-400">{d.secondaryLabel}</p>}
    </div>
  );
}

export function DonutBreakdown({ data }: { data: DonutSegment[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="text-sm text-neutral-400 dark:text-neutral-500">No data yet.</p>;
  }

  const config = Object.fromEntries(
    data.map((d) => [d.key, { label: d.label, color: d.color }])
  ) satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center gap-5">
      <ChartContainer config={config} className="mx-auto aspect-square h-44 w-44 shrink-0">
        <PieChart>
          <Tooltip content={<DonutTooltip total={total} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={data.length > 1 ? 2 : 0}
            strokeWidth={0}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="w-full space-y-2.5">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-ink dark:text-neutral-100">{d.label}</span>
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                {d.value} &middot; {pct}%
                {d.secondaryLabel ? ` · ${d.secondaryLabel}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
