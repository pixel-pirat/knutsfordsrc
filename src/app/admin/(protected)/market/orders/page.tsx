import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/market/OrderStatusBadges";
import { Pagination } from "@/components/admin/Pagination";
import { countAdminOrders, getAdminOrders, type OrderFilters } from "@/db/orderQueries";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  STORE_STATUS_LABELS,
  formatMarketplaceDate,
} from "@/lib/marketplace";
import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
} from "@/lib/orderWorkflow";
import { formatCurrency } from "@/lib/permits";

export const dynamic = "force-dynamic";

export default async function MarketOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
  }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = ORDER_STATUS_VALUES.includes(
    params.status as (typeof ORDER_STATUS_VALUES)[number]
  )
    ? params.status
    : undefined;
  const paymentStatus = PAYMENT_STATUS_VALUES.includes(
    params.paymentStatus as (typeof PAYMENT_STATUS_VALUES)[number]
  )
    ? params.paymentStatus
    : undefined;

  const page = parsePage(params.page);
  const filters: OrderFilters = { q, status, paymentStatus };

  const [orders, total] = await Promise.all([
    getAdminOrders({
      filters,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countAdminOrders(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(q || status || paymentStatus);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Orders &amp; Transactions
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Monitor marketplace orders, manual payments and fulfilment across all
          student stores.
        </p>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search order, buyer, store or seller"
          className="h-9 min-w-56 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus:border-gold dark:border-white/10 dark:text-neutral-100"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All order statuses</option>
          {ORDER_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          name="paymentStatus"
          defaultValue={paymentStatus ?? ""}
          className="h-9 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {PAYMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/admin/market/orders"
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
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Store / Seller</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Placed</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    <ClipboardList className="mx-auto mb-2 h-7 w-7" />
                    {hasFilters
                      ? "No orders match these filters."
                      : "No marketplace orders have been placed yet."}
                  </td>
                </tr>
              )}

              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/10"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/market/orders/${order.orderNumber}`}
                      className="font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/market/stores/${order.storeId}`}
                      className="font-medium text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                    >
                      {order.storeName}
                    </Link>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {order.sellerName} · {order.sellerIndexNumber}
                    </p>
                    {order.storeStatus !== "active" && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {STORE_STATUS_LABELS[order.storeStatus] ??
                          order.storeStatus}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink dark:text-neutral-100">
                      {order.buyerName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {order.buyerPhone}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">
                    {formatMarketplaceDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    <PaymentStatusBadge
                      paymentStatus={order.paymentStatus}
                    />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-ink dark:text-neutral-100">
                    {formatCurrency(order.subtotal)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/market/orders/${order.orderNumber}`}
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
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        basePath="/admin/market/orders"
        searchParams={{ q, status, paymentStatus }}
      />
    </div>
  );
}
