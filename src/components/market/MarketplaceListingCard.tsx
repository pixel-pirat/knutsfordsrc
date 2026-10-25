import Link from "next/link";
import { ImageOff, MapPin, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LISTING_TYPE_LABELS,
  PRODUCT_AVAILABILITY_LABELS,
  SERVICE_DELIVERY_LABELS,
  type PublicListing,
} from "@/lib/marketplace";
import { formatCurrency } from "@/lib/permits";
import { toCartItem } from "@/lib/marketplaceCartItem";
import { AddToCartButton } from "./AddToCartButton";

function availabilityText(listing: PublicListing) {
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

export function MarketplaceListingCard({
  listing,
  basePath,
}: {
  listing: PublicListing;
  basePath: string;
}) {
  const detailHref = `${basePath}/listings/${listing.type}/${listing.id}`;
  const storeHref = `${basePath}/store/${listing.store.slug}`;
  const availability = availabilityText(listing);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition-shadow hover:shadow-lg dark:bg-neutral-900 dark:ring-white/10">
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        {listing.imageUrl ? (
          // Seller-supplied images may come from any HTTPS host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
            {listing.type === "service" ? (
              <Wrench className="h-10 w-10" />
            ) : (
              <ImageOff className="h-10 w-10" />
            )}
          </span>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {listing.type === "service" ? (
            <Wrench className="h-3 w-3" />
          ) : null}
          {LISTING_TYPE_LABELS[listing.type]}
        </span>

        {!listing.inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
        {listing.compareAtPrice !== null && listing.inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
            Save{" "}
            {Math.round(
              ((listing.compareAtPrice - listing.price) /
                listing.compareAtPrice) *
                100
            )}
            %
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={detailHref} className="min-w-0">
            <h3 className="truncate text-sm font-bold text-ink transition-colors group-hover:text-gold-dark dark:text-neutral-100 dark:group-hover:text-gold-light sm:text-base">
              {listing.name}
            </h3>
          </Link>
          <Badge
            variant="outline"
            className={
              listing.inStock
                ? "shrink-0 border-green-200 bg-green-50 text-green-700"
                : "shrink-0 border-red-200 bg-red-50 text-red-700"
            }
          >
            {availability}
          </Badge>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {listing.description}
        </p>

        <Link
          href={storeHref}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-gold-dark dark:text-neutral-400 dark:hover:text-gold-light"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{listing.store.name}</span>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-lg font-extrabold text-ink dark:text-neutral-100">
              {formatCurrency(listing.price)}
              {listing.priceUnit && (
                <span className="ml-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                  / {listing.priceUnit}
                </span>
              )}
            </p>
            {listing.compareAtPrice !== null && (
              <p className="text-xs text-neutral-400 line-through dark:text-neutral-500">
                {formatCurrency(listing.compareAtPrice)}
              </p>
            )}
          </div>
          <AddToCartButton
            item={toCartItem(listing)}
            label={listing.type === "service" ? "Add service" : "Add"}
          />
        </div>
      </div>
    </article>
  );
}
