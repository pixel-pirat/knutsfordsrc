export type BarSegment = {
  key: string;
  label: string;
  count: number;
  revenue?: number;
};

export function BarBreakdown({
  data,
  formatSecondary,
  limit = 8,
}: {
  data: BarSegment[];
  formatSecondary?: (d: BarSegment) => string;
  limit?: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-neutral-500">No data yet.</p>;
  }

  const shown = data.slice(0, limit);
  const max = Math.max(...shown.map((d) => d.count), 1);

  return (
    <ul className="space-y-3.5">
      {shown.map((d) => (
        <li key={d.key}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink dark:text-neutral-100">{d.label}</span>
            <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
              {d.count}
              {formatSecondary ? ` · ${formatSecondary(d)}` : ""}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
