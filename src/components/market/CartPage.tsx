"use client";

import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { useMarketCart } from "@/lib/marketCart";
import { formatCurrency } from "@/lib/permits";

export function CartPage() {
  const { items, count, subtotal, updateQuantity, removeItem, clear } =
    useMarketCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-20 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-ink dark:text-neutral-100">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
          Browse verified student stores and add products or services to your
          cart.
        </p>
        <Link
          href="/market"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Browse marketplace
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const grouped = items.reduce<
    Record<
      string,
      {
        storeId: string;
        storeName: string;
        storeSlug: string;
        items: typeof items;
        subtotal: number;
      }
    >
  >((groups, item) => {
    const existing = groups[item.storeId] ?? {
      storeId: item.storeId,
      storeName: item.storeName,
      storeSlug: item.storeSlug,
      items: [],
      subtotal: 0,
    };
    existing.items.push(item);
    existing.subtotal += item.price * item.quantity;
    groups[item.storeId] = existing;
    return groups;
  }, {});

  const storeGroups = Object.values(grouped);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {count} item{count === 1 ? "" : "s"} from {storeGroups.length}{" "}
            store{storeGroups.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {storeGroups.map((group) => (
            <section
              key={group.storeId}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-3.5 dark:border-white/10">
                <Link
                  href={`/market/store/${group.storeSlug}`}
                  className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink hover:text-gold-dark dark:text-neutral-100 dark:hover:text-gold-light"
                >
                  <Store className="h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
                  <span className="truncate">{group.storeName}</span>
                </Link>
                <span className="shrink-0 text-sm font-semibold text-ink dark:text-neutral-100">
                  {formatCurrency(group.subtotal)}
                </span>
              </div>

              <ul className="divide-y divide-black/5 dark:divide-white/10">
                {group.items.map((item) => (
                  <li key={item.key} className="flex gap-4 p-4">
                    <Link
                      href={`/market/listings/${item.type}/${item.id}`}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
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
                          <ShoppingBag className="h-6 w-6" />
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/market/listings/${item.type}/${item.id}`}
                            className="line-clamp-2 text-sm font-bold text-ink hover:text-gold-dark dark:text-neutral-100 dark:hover:text-gold-light"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs capitalize text-neutral-400 dark:text-neutral-500">
                            {item.type} · {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.key)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <div className="inline-flex h-8 items-center rounded-lg border border-black/10 dark:border-white/10">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            className="flex h-full w-8 items-center justify-center text-neutral-500 disabled:opacity-40 dark:text-neutral-400"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-ink dark:text-neutral-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= item.maxQuantity}
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            className="flex h-full w-8 items-center justify-center text-neutral-500 disabled:opacity-40 dark:text-neutral-400"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-ink dark:text-neutral-100">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Order summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                <dt>
                  Subtotal ({count} item{count === 1 ? "" : "s"})
                </dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-black/5 pt-2 text-base font-extrabold text-ink dark:border-white/10 dark:text-neutral-100">
                <dt>Total</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
            </dl>

            <Link
              href="/market/checkout"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
            >
              Continue to checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-3 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
              You will choose pickup or delivery for each store at checkout.
              Orders are split by store so every seller can manage their own
              items.
            </p>

            <Link
              href="/market"
              className="mt-3 inline-flex w-full items-center justify-center text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
