import Link from "next/link";
import { MapPin, Package, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublicStores } from "@/db/marketplacePublicQueries";
import { CATEGORY_LABELS } from "@/lib/marketplace";

function StoreLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      // Seller-supplied logos may come from any HTTPS host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-xl font-extrabold text-gold-dark dark:text-gold-light">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export async function StoreDirectory({ basePath }: { basePath: string }) {
  const stores = await listPublicStores();

  if (stores.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <p className="text-base font-semibold text-ink dark:text-neutral-100">
          No student stores are open yet.
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Check back soon as more sellers get verified.
        </p>
        <Link
          href={basePath}
          className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-gold dark:text-ink"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => (
        <article
          key={store.id}
          className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-shadow hover:shadow-lg dark:bg-neutral-900 dark:ring-white/10"
        >
          <div className="flex items-start gap-4">
            <StoreLogo name={store.name} logoUrl={store.logoUrl} />
            <div className="min-w-0 flex-1">
              <Link
                href={`${basePath}/store/${store.slug}`}
                className="block truncate text-base font-bold text-ink hover:text-gold-dark dark:text-neutral-100 dark:hover:text-gold-light"
              >
                {store.name}
              </Link>
              <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                by {store.sellerFirstName}
                {store.sellerLevel ? ` · Level ${store.sellerLevel}` : ""}
              </p>
              <Badge variant="outline" className="mt-2 border-gold/30 bg-gold/10 text-gold-dark dark:text-gold-light">
                {CATEGORY_LABELS[store.category] ?? store.category}
              </Badge>
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {store.description || "A verified Knutsford student store."}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {store.productCount} product{store.productCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              {store.serviceCount} service{store.serviceCount === 1 ? "" : "s"}
            </span>
          </div>

          {store.pickupLocation && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{store.pickupLocation}</span>
            </p>
          )}

          <Link
            href={`${basePath}/store/${store.slug}`}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
          >
            Visit store
          </Link>
        </article>
      ))}
    </div>
  );
}
