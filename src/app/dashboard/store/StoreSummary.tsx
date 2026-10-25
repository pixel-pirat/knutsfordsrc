import { Badge } from "@/components/ui/badge";
import type { MarketplaceStore } from "@/db/schema";
import {
  CATEGORY_LABELS,
  FULFILMENT_LABELS,
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
} from "@/lib/marketplace";

export function StoreSummary({ store }: { store: MarketplaceStore }) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Your storefront
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-ink dark:text-neutral-100">
            {store.name}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {CATEGORY_LABELS[store.category] ?? store.category}
          </p>
        </div>
        <Badge variant="outline" className={STORE_STATUS_STYLES[store.status]}>
          {STORE_STATUS_LABELS[store.status] ?? store.status}
        </Badge>
      </div>

      {store.status === "suspended" && store.statusReason && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {store.statusReason}
        </p>
      )}

      <p className="mt-4 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
        {store.description || "No store description yet."}
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Fulfilment
          </dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {store.fulfilmentMethods
              .map((method) => FULFILMENT_LABELS[method] ?? method)
              .join(", ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Operating hours
          </dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {store.operatingHours || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Pickup location
          </dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {store.pickupLocation || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400 dark:text-neutral-500">
            Contact
          </dt>
          <dd className="break-all text-neutral-700 dark:text-neutral-300">
            {store.contactEmail || store.contactPhone || "—"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-gold/10 px-3 py-2.5 text-xs text-neutral-600 dark:text-neutral-300">
        This is how customers will see your storefront when the public
        marketplace opens.
      </p>
    </section>
  );
}
