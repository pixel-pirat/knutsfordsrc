import Link from "next/link";
import Image from "next/image";
import { Package, Wrench } from "lucide-react";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  countProductsForAdmin,
  countServicesForAdmin,
  getAdminListingCounts,
  listProductsForAdmin,
  listServicesForAdmin,
  type ListingStatus,
} from "@/db/listingQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/Pagination";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { formatCurrency } from "@/lib/permits";
import {
  MODERATION_STATUS_LABELS,
  MODERATION_STATUS_STYLES,
  PRODUCT_AVAILABILITY_LABELS,
  SERVICE_DELIVERY_LABELS,
  STORE_STATUS_LABELS,
  formatMarketplaceDate,
} from "@/lib/marketplace";

const STATUS_VALUES: ListingStatus[] = [
  "active",
  "pending_review",
  "removed",
];

type ListingType = "product" | "service";

function tabHref(
  type: ListingType,
  q: string | undefined,
  status: string | undefined
) {
  const params = new URLSearchParams({ type });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  return `/admin/market/products?${params.toString()}`;
}

export default async function MarketProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    q?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const type: ListingType = params.type === "service" ? "service" : "product";
  const q = params.q?.trim() || undefined;
  const status = STATUS_VALUES.includes(params.status as ListingStatus)
    ? (params.status as ListingStatus)
    : undefined;

  const page = parsePage(params.page);
  const filters = { q, status };

  const [counts, products, productTotal, services, serviceTotal] =
    await Promise.all([
      getAdminListingCounts(),
      type === "product"
        ? listProductsForAdmin({
            filters,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
          })
        : Promise.resolve([]),
      type === "product" ? countProductsForAdmin(filters) : Promise.resolve(0),
      type === "service"
        ? listServicesForAdmin({
            filters,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
          })
        : Promise.resolve([]),
      type === "service" ? countServicesForAdmin(filters) : Promise.resolve(0),
    ]);

  const total = type === "product" ? productTotal : serviceTotal;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Products &amp; Services
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Moderate listings across all student stores
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl bg-white p-1.5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <Link
          href={tabHref("product", q, status)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            type === "product"
              ? "bg-ink text-white dark:bg-gold dark:text-ink"
              : "text-neutral-500 hover:bg-black/[0.04] hover:text-ink dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-100"
          }`}
        >
          <Package className="h-4 w-4" />
          Products
          <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-black/20">
            {counts.productTotal}
          </span>
          {counts.productPending > 0 && (
            <span className="rounded-full bg-orange-100 px-1.5 text-xs text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
              {counts.productPending}
            </span>
          )}
        </Link>
        <Link
          href={tabHref("service", q, status)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            type === "service"
              ? "bg-ink text-white dark:bg-gold dark:text-ink"
              : "text-neutral-500 hover:bg-black/[0.04] hover:text-ink dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-100"
          }`}
        >
          <Wrench className="h-4 w-4" />
          Services
          <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-black/20">
            {counts.serviceTotal}
          </span>
          {counts.servicePending > 0 && (
            <span className="rounded-full bg-orange-100 px-1.5 text-xs text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
              {counts.servicePending}
            </span>
          )}
        </Link>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <input type="hidden" name="type" value={type} />
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search listing, store, seller or index number"
          className="h-9 min-w-56 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus:border-gold dark:border-white/10 dark:text-neutral-100"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All statuses</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {MODERATION_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Filter
        </button>
        {(q || status) && (
          <Link
            href={`/admin/market/products?type=${type}`}
            className="text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                <th className="px-5 py-3">Listing</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">
                  {type === "product" ? "Stock" : "Duration"}
                </th>
                <th className="px-5 py-3">Listed</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {type === "product" && products.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No product listings match these filters.
                  </td>
                </tr>
              )}
              {type === "service" && services.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No service listings match these filters.
                  </td>
                </tr>
              )}

              {type === "product" &&
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-black/5 last:border-0 dark:border-white/10"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                              <Package className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/market/products/product/${product.id}`}
                            className="font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {product.category}
                            {!product.published &&
                              product.moderationStatus === "active" &&
                              " · Draft"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                      <Link
                        href={`/admin/market/stores/${product.storeId}`}
                        className="font-medium hover:text-gold-dark hover:underline dark:hover:text-gold-light"
                      >
                        {product.storeName}
                      </Link>
                      {product.storeStatus !== "active" && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {STORE_STATUS_LABELS[product.storeStatus] ??
                            product.storeStatus}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {product.studentFirstName} {product.studentLastName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {product.indexNumber}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                      {formatCurrency(product.discountPrice ?? product.price)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {product.stockQuantity}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {PRODUCT_AVAILABILITY_LABELS[product.availability] ??
                          product.availability}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                      {formatMarketplaceDate(product.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={
                          MODERATION_STATUS_STYLES[product.moderationStatus]
                        }
                      >
                        {MODERATION_STATUS_LABELS[product.moderationStatus]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/market/products/product/${product.id}`}
                        className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}

              {type === "service" &&
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-black/5 last:border-0 dark:border-white/10"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                          {service.imageUrl ? (
                            <Image
                              src={service.imageUrl}
                              alt={service.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                              <Wrench className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/market/products/service/${service.id}`}
                            className="font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                          >
                            {service.name}
                          </Link>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {service.category}
                            {!service.published &&
                              service.moderationStatus === "active" &&
                              " · Draft"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                      <Link
                        href={`/admin/market/stores/${service.storeId}`}
                        className="font-medium hover:text-gold-dark hover:underline dark:hover:text-gold-light"
                      >
                        {service.storeName}
                      </Link>
                      {service.storeStatus !== "active" && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {STORE_STATUS_LABELS[service.storeStatus] ??
                            service.storeStatus}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {service.studentFirstName} {service.studentLastName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {service.indexNumber}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                      {formatCurrency(service.price)}
                      {service.pricingUnit ? (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {service.pricingUnit}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                      {service.durationMinutes
                        ? `${service.durationMinutes} min`
                        : "—"}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {SERVICE_DELIVERY_LABELS[service.deliveryMethod] ??
                          service.deliveryMethod}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                      {formatMarketplaceDate(service.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={
                          MODERATION_STATUS_STYLES[service.moderationStatus]
                        }
                      >
                        {MODERATION_STATUS_LABELS[service.moderationStatus]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/market/products/service/${service.id}`}
                        className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          basePath="/admin/market/products"
          searchParams={{ type, q, status }}
        />
      </div>
    </div>
  );
}
