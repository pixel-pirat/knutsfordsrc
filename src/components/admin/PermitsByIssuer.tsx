import { formatCurrency } from "@/lib/permits";

type IssuerRow = {
  issuerId: string;
  issuerName: string;
  count: number;
  revenue: string;
};

export function PermitsByIssuer({ data }: { data: IssuerRow[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-neutral-500">No permits issued yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className="space-y-4">
      {data.map((d) => (
        <li key={d.issuerId}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-ink dark:text-neutral-100">{d.issuerName}</span>
            <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
              {d.count} permit{d.count === 1 ? "" : "s"} &middot; {formatCurrency(d.revenue)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
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
