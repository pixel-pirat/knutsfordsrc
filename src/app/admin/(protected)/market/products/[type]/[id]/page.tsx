import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, Wrench } from "lucide-react";
import { getCurrentAdmin } from "@/db/adminQueries";
import { getListingDetail } from "@/db/listingQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { formatCurrency } from "@/lib/permits";
import {
  FULFILMENT_LABELS,
  MODERATION_STATUS_LABELS,
  MODERATION_STATUS_STYLES,
  PRODUCT_AVAILABILITY_LABELS,
  SERVICE_DELIVERY_LABELS,
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
  formatMarketplaceDateTime,
} from "@/lib/marketplace";
import { ListingModerationPanel } from "./ListingModerationPanel";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const { type, id } = await params;
  if (type !== "product" && type !== "service") notFound();
  if (!UUID_PATTERN.test(id)) notFound();

  const detail = await getListingDetail(type, id);
  if (!detail) notFound();

  const { store, student } = detail;
  const listing = detail.listing;
  const isProduct = detail.type === "product";

  return (
    <div>
      <Link
        href={`/admin/market/products?type=${type}`}
        className="text-sm font-medium text-gold-dark hover:underline dark:text-gold-light"
      >
        ← Products &amp; Services
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {listing.imageUrl ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
              <Image
                src={listing.imageUrl}
                alt={listing.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold-light">
              {isProduct ? (
                <Package className="h-6 w-6" />
              ) : (
                <Wrench className="h-6 w-6" />
              )}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
                {listing.name}
              </h1>
              <Badge
                variant="outline"
                className={MODERATION_STATUS_STYLES[listing.moderationStatus]}
              >
                {MODERATION_STATUS_LABELS[listing.moderationStatus]}
              </Badge>
              {!listing.published && (
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-neutral-100 text-neutral-500"
                >
                  Draft
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {isProduct ? "Product" : "Service"} · {listing.category}
            </p>
          </div>
        </div>
        <p className="text-xl font-extrabold text-ink dark:text-neutral-100">
          {formatCurrency(listing.price)}
          {"pricingUnit" in listing && listing.pricingUnit && (
            <span className="ml-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {listing.pricingUnit}
            </span>
          )}
        </p>
      </div>

      {listing.moderationStatus !== "active" && listing.moderationReason && (
        <p className="mb-6 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:ring-orange-900">
          {MODERATION_STATUS_LABELS[listing.moderationStatus]}:{" "}
          {listing.moderationReason}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Listing details
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Category">{listing.category}</Detail>
              <Detail label="Price">{formatCurrency(listing.price)}</Detail>
              {isProduct && "stockQuantity" in listing && (
                <>
                  <Detail label="Discount price">
                    {listing.discountPrice
                      ? formatCurrency(listing.discountPrice)
                      : "—"}
                  </Detail>
                  <Detail label="Stock quantity">
                    {listing.stockQuantity}
                  </Detail>
                  <Detail label="Low stock alert">
                    {listing.lowStockThreshold}
                  </Detail>
                  <Detail label="Availability">
                    {PRODUCT_AVAILABILITY_LABELS[listing.availability] ??
                      listing.availability}
                  </Detail>
                  <Detail label="Fulfilment">
                    {listing.fulfilmentMethods
                      .map((method) => FULFILMENT_LABELS[method] ?? method)
                      .join(", ") || "—"}
                  </Detail>
                </>
              )}
              {!isProduct && "deliveryMethod" in listing && (
                <>
                  <Detail label="Pricing unit">
                    {listing.pricingUnit || "—"}
                  </Detail>
                  <Detail label="Duration">
                    {listing.durationMinutes
                      ? `${listing.durationMinutes} minutes`
                      : "—"}
                  </Detail>
                  <Detail label="Availability">
                    {listing.availability || "—"}
                  </Detail>
                  <Detail label="Delivery method">
                    {SERVICE_DELIVERY_LABELS[listing.deliveryMethod] ??
                      listing.deliveryMethod}
                  </Detail>
                  <Detail label="Booking required">
                    {listing.bookingRequired ? "Yes" : "No"}
                  </Detail>
                </>
              )}
              <Detail label="Listed">
                {formatMarketplaceDateTime(listing.createdAt)}
              </Detail>
              <Detail label="Last updated">
                {formatMarketplaceDateTime(listing.updatedAt)}
              </Detail>
              <Detail label="Last moderated">
                {listing.moderatedAt
                  ? formatMarketplaceDateTime(listing.moderatedAt)
                  : "—"}
              </Detail>
            </dl>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Description
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {listing.description}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Store
            </h2>
            <div className="mt-4 flex items-center gap-3">
              {store.logoUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10">
                  <Image
                    src={store.logoUrl}
                    alt={`${store.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-sm font-extrabold text-gold-dark dark:text-gold-light">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                  {store.name}
                </p>
                <Badge
                  variant="outline"
                  className={`mt-1 ${STORE_STATUS_STYLES[store.status]}`}
                >
                  {STORE_STATUS_LABELS[store.status] ?? store.status}
                </Badge>
              </div>
            </div>
            <Link
              href={`/admin/market/stores/${store.id}`}
              className="mt-4 inline-block text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
            >
              View store record
            </Link>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
              Seller
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <UserAvatar
                name={`${student.firstName} ${student.lastName}`}
                avatarUrl={student.avatarUrl}
                size="default"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                  {student.firstName} {student.lastName}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {student.indexNumber}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2">
              <Detail label="Email">{student.email ?? "—"}</Detail>
              <Detail label="Phone">{student.phone ?? "—"}</Detail>
              <Detail label="Programme">{student.program ?? "—"}</Detail>
              <Detail label="Level">
                {student.level ? `Level ${student.level}` : "—"}
              </Detail>
            </dl>
            <Link
              href={`/admin/students/${student.id}`}
              className="mt-4 inline-block text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
            >
              View student record
            </Link>
          </section>

          <ListingModerationPanel
            type={detail.type}
            listingId={listing.id}
            status={listing.moderationStatus}
            existingReason={listing.moderationReason}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
        {children}
      </dd>
    </div>
  );
}
