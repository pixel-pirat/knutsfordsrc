import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import {
  FULFILMENT_LABELS,
  formatMarketplaceDateTime,
  type BuyerOrderDetail as BuyerOrderDetailType,
} from "@/lib/marketplace";
import { formatCurrency } from "@/lib/permits";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadges";
import { OrderTimeline } from "./OrderTimeline";

export function BuyerOrderDetail({
  order,
  backHref,
  backLabel = "My orders",
  basePath,
  buyerIndexNumber,
  asideExtra,
  paymentActions,
  complaintAction,
  sellerMeta,
  showStoreHelp = true,
}: {
  order: BuyerOrderDetailType;
  backHref: string;
  backLabel?: string;
  basePath: string;
  buyerIndexNumber?: string | null;
  asideExtra?: React.ReactNode;
  paymentActions?: React.ReactNode;
  complaintAction?: React.ReactNode;
  sellerMeta?: React.ReactNode;
  showStoreHelp?: boolean;
}) {
  const storeHref = `${basePath}/store/${order.storeSlug}`;
  const instructions =
    order.paymentInstructions ?? order.storePaymentInstructions;

  return (
    <div>
      <Link
        href={backHref}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Order
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <CalendarDays className="h-4 w-4" />
            {formatMarketplaceDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge paymentStatus={order.paymentStatus} />
        </div>
      </div>

      {order.status === "cancelled" && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
          <p className="font-semibold">This order was cancelled.</p>
          {order.cancellationReason && (
            <p className="mt-1">{order.cancellationReason}</p>
          )}
          {order.cancelledAt && (
            <p className="mt-1 text-xs">
              {formatMarketplaceDateTime(order.cancelledAt)}
            </p>
          )}
        </div>
      )}

      {sellerMeta}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-3.5 dark:border-white/10">
              <Link
                href={storeHref}
                className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink hover:text-gold-dark dark:text-neutral-100 dark:hover:text-gold-light"
              >
                <Store className="h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
                <span className="truncate">{order.storeName}</span>
              </Link>
              <span className="shrink-0 text-sm font-semibold text-ink dark:text-neutral-100">
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4">
                  <Link
                    href={`${basePath}/listings/${item.listingType}/${item.listingId}`}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                        <ShoppingBag className="h-5 w-5" />
                      </span>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`${basePath}/listings/${item.listingType}/${item.listingId}`}
                        className="line-clamp-2 text-sm font-semibold text-ink hover:text-gold-dark dark:text-neutral-100 dark:hover:text-gold-light"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-ink dark:text-neutral-100">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-black/5 px-5 py-4 dark:border-white/10">
              <span className="text-sm font-semibold text-ink dark:text-neutral-100">
                Order total
              </span>
              <span className="text-lg font-extrabold text-ink dark:text-neutral-100">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Fulfilment details
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Method
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-ink dark:text-neutral-100">
                  <Truck className="h-4 w-4 text-neutral-400" />
                  {FULFILMENT_LABELS[order.fulfilmentMethod] ??
                    order.fulfilmentMethod}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  {showStoreHelp ? "Contact" : "Buyer"}
                </dt>
                <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                  {order.buyerName}
                  {buyerIndexNumber && (
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {buyerIndexNumber}
                    </span>
                  )}
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {order.buyerPhone}
                    {order.buyerEmail ? ` · ${order.buyerEmail}` : ""}
                  </span>
                </dd>
              </div>
              {order.fulfilmentMethod === "delivery" &&
                order.deliveryAddress && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      Delivery address
                    </dt>
                    <dd className="mt-1 flex items-start gap-1.5 font-medium text-ink dark:text-neutral-100">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                      {order.deliveryAddress}
                    </dd>
                  </div>
                )}
              {order.storePickupLocation && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Pickup location
                  </dt>
                  <dd className="mt-1 flex items-start gap-1.5 font-medium text-ink dark:text-neutral-100">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    {order.storePickupLocation}
                  </dd>
                </div>
              )}
              {order.buyerNote && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    {showStoreHelp ? "Buyer note" : "Your note"}
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                    {order.buyerNote}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Order activity
            </h2>
            <div className="mt-4">
              <OrderTimeline events={order.events} />
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {asideExtra}

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold-dark dark:text-gold-light" />
              <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
                Payment
              </h2>
            </div>
            <div className="mt-3">
              <PaymentStatusBadge paymentStatus={order.paymentStatus} />
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600 ring-1 ring-black/5 dark:bg-neutral-800/60 dark:text-neutral-300 dark:ring-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Payment instructions
              </p>
              {instructions ? (
                <p className="mt-1.5 whitespace-pre-line leading-relaxed">
                  {instructions}
                </p>
              ) : (
                <p className="mt-1.5 leading-relaxed">
                  The seller has not added payment instructions yet. Contact
                  them using the details below.
                </p>
              )}
            </div>

            {order.paymentReference && (
              <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Payment reference
                </p>
                <p className="mt-0.5 font-medium">{order.paymentReference}</p>
                {order.paymentSubmittedAt && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Submitted{" "}
                    {formatMarketplaceDateTime(order.paymentSubmittedAt)}
                  </p>
                )}
              </div>
            )}

            {order.paidAt && (
              <p className="mt-3 text-xs font-semibold text-green-700 dark:text-green-400">
                Payment confirmed{" "}
                {formatMarketplaceDateTime(order.paidAt)}
              </p>
            )}

            {paymentActions}
          </section>

          {complaintAction && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
                Having an issue?
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                File a complaint and the SRC will review it alongside the
                store.
              </p>
              <div className="mt-3">{complaintAction}</div>
            </section>
          )}

          {showStoreHelp && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
                Need help?
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Contact the store about this order. Keep your order number
                handy.
              </p>
              <div className="mt-3 space-y-2 text-sm">
                {order.storeContactEmail && (
                  <a
                    href={`mailto:${order.storeContactEmail}?subject=${encodeURIComponent(
                      `Order ${order.orderNumber}`
                    )}`}
                    className="flex items-center gap-2 text-gold-dark hover:underline dark:text-gold-light"
                  >
                    <Mail className="h-4 w-4" />
                    {order.storeContactEmail}
                  </a>
                )}
                {order.storeContactPhone && (
                  <a
                    href={`tel:${order.storeContactPhone}`}
                    className="flex items-center gap-2 text-gold-dark hover:underline dark:text-gold-light"
                  >
                    <Phone className="h-4 w-4" />
                    {order.storeContactPhone}
                  </a>
                )}
                {!order.storeContactEmail && !order.storeContactPhone && (
                  <p className="text-neutral-500 dark:text-neutral-400">
                    The seller will contact you using the details you provided.
                  </p>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
