import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ImageOff,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublicListing } from "@/db/marketplacePublicQueries";
import {
  FULFILMENT_LABELS,
  LISTING_TYPE_LABELS,
  PRODUCT_AVAILABILITY_LABELS,
  SERVICE_DELIVERY_LABELS,
  formatMarketplaceDate,
  type MarketplaceListingType,
} from "@/lib/marketplace";
import { formatCurrency } from "@/lib/permits";
import { toCartItem } from "@/lib/marketplaceCartItem";
import { MarketplaceListingCard } from "./MarketplaceListingCard";
import { PurchasePanel } from "./AddToCartButton";

function availabilityText(listing: {
  type: MarketplaceListingType;
  availability: string;
  stockQuantity: number | null;
  deliveryMethod: string | null;
}) {
  if (listing.type === "product") {
    if (
      listing.availability === "ready_stock" &&
      listing.stockQuantity !== null
    ) {
      return listing.stockQuantity > 0
        ? `${listing.stockQuantity} in stock`
        : "Out of stock";
    }
    return PRODUCT_AVAILABILITY_LABELS[listing.availability] ?? "Available";
  }
  return (
    listing.availability ||
    SERVICE_DELIVERY_LABELS[listing.deliveryMethod ?? ""] ||
    "Available"
  );
}

export async function ListingDetail({
  type,
  id,
  basePath,
}: {
  type: MarketplaceListingType;
  id: string;
  basePath: string;
}) {
  const data = await getPublicListing(type, id);
  if (!data) notFound();

  const { listing, related } = data;
  const storeHref = `${basePath}/store/${listing.store.slug}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-ink dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Marketplace
        </Link>
        <span>/</span>
        <Link
          href={storeHref}
          className="font-semibold transition-colors hover:text-ink dark:hover:text-neutral-100"
        >
          {listing.store.name}
        </Link>
        <span>/</span>
        <span className="truncate">{listing.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800">
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrl}
                alt={listing.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                {listing.type === "service" ? (
                  <Wrench className="h-16 w-16" />
                ) : (
                  <ImageOff className="h-16 w-16" />
                )}
              </span>
            )}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur">
              {listing.type === "service" ? (
                <Wrench className="h-3.5 w-3.5" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              {LISTING_TYPE_LABELS[listing.type]}
            </span>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-extrabold text-ink dark:text-neutral-100">
              About this {listing.type}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {listing.description}
            </p>

            <dl className="mt-6 grid gap-4 border-t border-black/5 pt-5 text-sm dark:border-white/10 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Category
                </dt>
                <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                  {listing.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Listed
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-ink dark:text-neutral-100">
                  <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
                  {formatMarketplaceDate(listing.createdAt)}
                </dd>
              </div>
              {listing.type === "product" && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Availability
                  </dt>
                  <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                    {availabilityText(listing)}
                  </dd>
                </div>
              )}
              {listing.type === "service" && (
                <>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      Delivery
                    </dt>
                    <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                      {SERVICE_DELIVERY_LABELS[
                        listing.deliveryMethod ?? ""
                      ] ?? "On request"}
                    </dd>
                  </div>
                  {listing.durationMinutes !== null && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                        Duration
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-medium text-ink dark:text-neutral-100">
                        <Clock3 className="h-3.5 w-3.5 text-neutral-400" />
                        {listing.durationMinutes} minutes
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      Booking
                    </dt>
                    <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                      {listing.bookingRequired
                        ? "Booking required"
                        : "No booking required"}
                    </dd>
                  </div>
                </>
              )}
            </dl>

            {listing.fulfilmentMethods.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Fulfilment options
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.fulfilmentMethods.map((method) => (
                    <Badge
                      key={method}
                      variant="outline"
                      className="border-black/10 bg-neutral-50 text-neutral-600 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {FULFILMENT_LABELS[method] ?? method}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
                {listing.name}
              </h1>
              <Badge
                variant="outline"
                className={
                  listing.inStock
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              >
                {availabilityText(listing)}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Sold by{" "}
              <Link
                href={storeHref}
                className="font-semibold text-gold-dark hover:underline dark:text-gold-light"
              >
                {listing.store.name}
              </Link>
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-2">
              <p className="text-3xl font-extrabold text-ink dark:text-neutral-100">
                {formatCurrency(listing.price)}
              </p>
              {listing.priceUnit && (
                <p className="pb-1 text-sm font-medium text-neutral-400 dark:text-neutral-500">
                  per {listing.priceUnit}
                </p>
              )}
              {listing.compareAtPrice !== null && (
                <p className="pb-1.5 text-sm text-neutral-400 line-through dark:text-neutral-500">
                  {formatCurrency(listing.compareAtPrice)}
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-black/5 pt-5 dark:border-white/10">
              <PurchasePanel item={toCartItem(listing)} />
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-xs text-green-700 ring-1 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-900">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              This store is verified by the Knutsford SRC. Listings are
              moderated after publication.
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div className="flex items-center gap-2">
              {listing.store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.store.logoUrl}
                  alt={`${listing.store.name} logo`}
                  className="h-11 w-11 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15 text-base font-extrabold text-gold-dark dark:text-gold-light">
                  {listing.store.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <Link
                  href={storeHref}
                  className="block truncate font-bold text-ink hover:text-gold-dark dark:text-neutral-100 dark:hover:text-gold-light"
                >
                  {listing.store.name}
                </Link>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {listing.store.sellerFirstName}
                  {listing.store.sellerLevel
                    ? ` · Level ${listing.store.sellerLevel}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              {listing.store.pickupLocation && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  {listing.store.pickupLocation}
                </p>
              )}
              {listing.store.operatingHours && (
                <p className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  {listing.store.operatingHours}
                </p>
              )}
              {listing.store.contactEmail && (
                <a
                  href={`mailto:${listing.store.contactEmail}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                  {listing.store.contactEmail}
                </a>
              )}
              {listing.store.contactPhone && (
                <a
                  href={`tel:${listing.store.contactPhone}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                  {listing.store.contactPhone}
                </a>
              )}
            </div>

            <Link
              href={storeHref}
              className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-black/10 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
            >
              <Store className="h-4 w-4" />
              Visit store
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-extrabold text-ink dark:text-neutral-100">
              More from {listing.store.name}
            </h2>
            <Link
              href={storeHref}
              className="text-sm font-semibold text-gold-dark hover:underline dark:text-gold-light"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <MarketplaceListingCard
                key={item.key}
                listing={item}
                basePath={basePath}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
