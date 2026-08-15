export function StatusBreakdownBar({
  active,
  pending,
  expired,
}: {
  active: number;
  pending: number;
  expired: number;
}) {
  const total = Math.max(1, active + pending + expired);
  const segments = [
    { label: "Active", value: active, bar: "bg-green-500", dot: "bg-green-500" },
    { label: "Pending", value: pending, bar: "bg-gold", dot: "bg-gold" },
    { label: "Expired", value: expired, bar: "bg-neutral-300", dot: "bg-neutral-300" },
  ];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
        {segments.map(
          (s) =>
            s.value > 0 && (
              <div
                key={s.label}
                className={`h-full ${s.bar}`}
                style={{ width: `${(s.value / total) * 100}%` }}
              />
            )
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            <span className="text-neutral-600">{s.label}</span>
            <span className="font-semibold text-ink">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
