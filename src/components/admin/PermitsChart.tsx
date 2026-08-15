"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/permits";

type DayData = { day: string; count: number; revenue: string };

export function PermitsChart({ data }: { data: DayData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div>
      <div className="flex h-40 gap-1.5 sm:gap-2">
        {data.map((d, i) => {
          const heightPct = d.count === 0 ? 3 : Math.max(6, (d.count / maxCount) * 100);
          const isHovered = hovered === i;
          return (
            <div
              key={d.day + i}
              className="relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && (
                <div className="absolute bottom-full mb-2 z-10 w-max max-w-[9rem] -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-center text-xs text-white shadow-lg left-1/2">
                  <p className="font-semibold">{d.count} permit{d.count === 1 ? "" : "s"}</p>
                  <p className="text-neutral-300">{formatCurrency(d.revenue)}</p>
                  <p className="text-neutral-400">{d.day}</p>
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-colors ${
                  isHovered ? "bg-gold-dark" : "bg-gold"
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((d, i) => (
          <div key={d.day + i} className="flex-1 text-center">
            {(i % 2 === 0 || i === data.length - 1) && (
              <span className="text-[10px] text-neutral-400">{d.day}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
