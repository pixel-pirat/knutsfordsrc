"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/permits";

type DayData = { day: string; count: number; revenue: string };

const chartConfig = {
  count: {
    label: "Permits",
    color: "var(--color-gold)",
  },
} satisfies ChartConfig;

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DayData }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">
        {d.count} permit{d.count === 1 ? "" : "s"}
      </p>
      <p className="text-neutral-300">{formatCurrency(d.revenue)}</p>
      <p className="text-neutral-400">{d.day}</p>
    </div>
  );
}

export function PermitsChart({ data }: { data: DayData[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="permitsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={28}
          tick={{ fontSize: 10 }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-gold)", strokeOpacity: 0.2 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-gold)"
          strokeWidth={2}
          fill="url(#permitsFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
