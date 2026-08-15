export function StatusBreakdownBar({
  active,
  expired,
}: {
  active: number;
  expired: number;
}) {
  const total = Math.max(1, active + expired);
  const activePct = (active / total) * 100;
  const expiredPct = (expired / total) * 100;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
        {active > 0 && (
          <div className="h-full bg-gold" style={{ width: `${activePct}%` }} />
        )}
        {expired > 0 && (
          <div className="h-full bg-neutral-300" style={{ width: `${expiredPct}%` }} />
        )}
      </div>
      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          <span className="text-neutral-600">Active</span>
          <span className="font-semibold text-ink">{active}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="text-neutral-600">Expired</span>
          <span className="font-semibold text-ink">{expired}</span>
        </div>
      </div>
    </div>
  );
}
