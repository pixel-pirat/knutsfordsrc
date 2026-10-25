import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Mail,
  MapPin,
  Phone,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublicStorefront } from "@/db/marketplacePublicQueries";
import { CATEGORY_LABELS } from "@/lib/marketplace";
import { MarketplaceListingCard } from "./MarketplaceListingCard";

function StoreLogo({
  name,
  logoUrl,
  large = false,
}: {
  name: string;
  logoUrl: string | null;
  large?: boolean;
}) {
  const className = large ? "h-20 w-20 rounded-2xl" : "h-14 w-14 rounded-xl";

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${className} shrink-0 object-cover ring-1 ring-black/5 dark:ring-white/10`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-gold text-ink ring-1 ring-black/5 dark:ring-white/10 ${
        large ? "text-3xl" : "text-xl"
      } font-extrabold`}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export async function Storefront({
  slug,
  basePath,
}: {
  slug: string;
  basePath: string;
}) {
  const data = await getPublicStorefront(slug);
  if (!data) notFound();

  const { store, listings } = data;
  const products = listings.filter((listing) => listing.type === "product");
  const services = listings.filter((listing) => listing.type === "service");

  return (
    <div>
      <Link
        href={`${basePath}/stores`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        All stores
      </Link>

      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="h-2 bg-gold" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <StoreLogo name={store.name} logoUrl={store.logoUrl} large />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
                  {store.name}
                </h1>
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  Verified store
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gold/30 bg-gold/10 text-gold-dark dark:text-gold-light"
                >
                  {CATEGORY_LABELS[store.category] ?? store.category}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Run by {store.sellerFirstName}
                {store.sellerLevel ? ` · Level ${store.sellerLevel}` : ""}
                {store.sellerProgram ? ` · ${store.sellerProgram}` : ""}
              </p>
              <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {store.description || "A verified Knutsford student store."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-black/5 pt-5 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            <p className="flex items-start gap-2">
              <Store className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Listings
                </span>
                {products.length} product{products.length === 1 ? "" : "s"} ·{" "}
                {services.length} service{services.length === 1 ? "" : "s"}
              </span>
            </p>
            {store.pickupLocation && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Pickup
                  </span>
                  {store.pickupLocation}
                </span>
              </p>
            )}
            {store.operatingHours && (
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Hours
                  </span>
                  {store.operatingHours}
                </span>
              </p>
            )}
            {(store.contactEmail || store.contactPhone) && (
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
                <div className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Contact
                  </span>
                  {store.contactEmail && (
                    <a
                      href={`mailto:${store.contactEmail}`}
                      className="block truncate hover:underline"
                    >
                      {store.contactEmail}
                    </a>
                  )}
                  {store.contactPhone && (
                    <a
                      href={`tel:${store.contactPhone}`}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {store.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-base font-semibold text-ink dark:text-neutral-100">
            This store has not published any listings yet.
          </p>
          <Link
            href={basePath}
            className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-gold dark:text-ink"
          >
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-xl font-extrabold text-ink dark:text-neutral-100">
                  Products
                </h2>
                <span className="text-sm text-neutral-400 dark:text-neutral-500">
                  {products.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((listing) => (
                  <MarketplaceListingCard
                    key={listing.key}
                    listing={listing}
                    basePath={basePath}
                  />
                ))}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-xl font-extrabold text-ink dark:text-neutral-100">
                  Services
                </h2>
                <span className="text-sm text-neutral-400 dark:text-neutral-500">
                  {services.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((listing) => (
                  <MarketplaceListingCard
                    key={listing.key}
                    listing={listing}
                    basePath={basePath}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
