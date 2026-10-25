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

export function BuyerOrderDetail({
  order,
  backHref,
  basePath,
}: {
  order: BuyerOrderDetailType;
  backHref: string;
  basePath: string;
}) {
  const storeHref = `${basePath}/store/${order.storeSlug}`;

  return (
    <div>
      <Link
        href={backHref}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        My orders
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
                  Contact
                </dt>
                <dd className="mt-1 font-medium text-ink dark:text-neutral-100">
                  {order.buyerName}
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
                    Your note
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                    {order.buyerNote}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
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
            <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Payment is arranged directly with {order.storeName}. The seller
              will contact you with their payment instructions and confirm when
              payment is received.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Need help?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Contact the store about this order. Keep your order number handy.
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
        </aside>
      </div>
    </div>
  );
}
