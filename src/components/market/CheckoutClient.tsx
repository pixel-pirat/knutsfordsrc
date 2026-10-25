"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShoppingBag,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { FormField, inputClass } from "@/components/FormField";
import {
  FULFILMENT_LABELS,
  type BuyerOrderSummary,
} from "@/lib/marketplace";
import { useMarketCart, type CartItem } from "@/lib/marketCart";
import { formatCurrency } from "@/lib/permits";

type CheckoutStudent = {
  firstName: string;
  lastName: string;
  indexNumber: string;
  phone: string | null;
  email: string | null;
};

type StoreSetting = {
  fulfilmentMethod: string;
  deliveryAddress: string;
  note: string;
};

type StoreGroup = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storePickupLocation: string | null;
  methods: string[];
  items: CartItem[];
  subtotal: number;
};

type CheckoutResponse = {
  checkoutGroupId: string;
  total: number;
  orders: BuyerOrderSummary[];
  error?: string;
};

function groupCartItems(items: CartItem[]): StoreGroup[] {
  const groups = new Map<string, StoreGroup>();

  for (const item of items) {
    const group = groups.get(item.storeId) ?? {
      storeId: item.storeId,
      storeName: item.storeName,
      storeSlug: item.storeSlug,
      storePickupLocation: item.storePickupLocation,
      methods:
        item.storeFulfilmentMethods.length > 0
          ? item.storeFulfilmentMethods
          : ["campus_pickup"],
      items: [],
      subtotal: 0,
    };
    group.items.push(item);
    group.subtotal += item.price * item.quantity;
    groups.set(item.storeId, group);
  }

  return [...groups.values()];
}

function EmptyCheckout() {
  return (
    <div className="rounded-2xl bg-white px-6 py-20 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-xl font-extrabold text-ink dark:text-neutral-100">
        Nothing to check out yet
      </h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        Add products or services to your cart before continuing to checkout.
      </p>
      <Link
        href="/market"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white dark:bg-gold dark:text-ink"
      >
        Browse marketplace
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function CheckoutClient({ student }: { student: CheckoutStudent }) {
  const { items } = useMarketCart();

  if (items.length === 0) return <EmptyCheckout />;

  return <CheckoutForm student={student} items={items} />;
}

function CheckoutForm({
  student,
  items,
}: {
  student: CheckoutStudent;
  items: CartItem[];
}) {
  const router = useRouter();
  const { count, subtotal, clear } = useMarketCart();
  const groups = groupCartItems(items);

  const [phone, setPhone] = useState(student.phone ?? "");
  const [email, setEmail] = useState(student.email ?? "");
  const [settings, setSettings] = useState<Record<string, StoreSetting>>(() =>
    Object.fromEntries(
      groups.map((group) => [
        group.storeId,
        {
          fulfilmentMethod: group.methods[0] ?? "campus_pickup",
          deliveryAddress: "",
          note: "",
        },
      ])
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSetting(
    storeId: string,
    patch: Partial<StoreSetting>
  ) {
    setSettings((current) => ({
      ...current,
      [storeId]: {
        ...current[storeId],
        ...patch,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (phone.trim().length < 7) {
      setError("Enter a valid phone number so your sellers can reach you.");
      return;
    }

    for (const group of groups) {
      const setting = settings[group.storeId];
      if (!setting) {
        setError(`Choose a fulfilment method for ${group.storeName}.`);
        return;
      }
      if (
        setting.fulfilmentMethod === "delivery" &&
        !setting.deliveryAddress.trim()
      ) {
        setError(`Enter a delivery address for ${group.storeName}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          email: email.trim(),
          items: items.map((item) => ({
            type: item.type,
            id: item.id,
            quantity: item.quantity,
          })),
          stores: groups.map((group) => ({
            storeId: group.storeId,
            fulfilmentMethod:
              settings[group.storeId]?.fulfilmentMethod ?? "campus_pickup",
            deliveryAddress: settings[group.storeId]?.deliveryAddress ?? "",
            note: settings[group.storeId]?.note ?? "",
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | CheckoutResponse
        | null;

      if (!response.ok) {
        setError(data?.error ?? "We could not place your order. Please try again.");
        return;
      }
      if (!data) {
        setError("We could not place your order. Please try again.");
        return;
      }

      clear();
      toast.success("Order placed successfully");
      router.push(`/market/checkout/success?group=${data.checkoutGroupId}`);
    } catch {
      setError("We could not place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/market/cart"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Confirm your details and choose how each store should fulfil your
          order.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h2 className="text-base font-extrabold text-ink dark:text-neutral-100">
              Contact details
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Sellers use these details to confirm payment and fulfilment.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Phone number" htmlFor="checkout-phone">
                <input
                  id="checkout-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="024 000 0000"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Email (optional)"
                htmlFor="checkout-email"
                hint="Receipt updates can be sent here later."
              >
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </FormField>
            </div>
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              Buying as {student.firstName} {student.lastName} ·{" "}
              {student.indexNumber}
            </p>
          </section>

          {groups.map((group) => {
            const setting = settings[group.storeId];
            return (
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

                <div className="p-5">
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li
                        key={item.key}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink dark:text-neutral-100">
                            {item.quantity} x {item.name}
                          </span>
                          <span className="text-xs capitalize text-neutral-400 dark:text-neutral-500">
                            {item.type}
                          </span>
                        </span>
                        <span className="shrink-0 font-semibold text-ink dark:text-neutral-100">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 border-t border-black/5 pt-5 dark:border-white/10">
                    <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                      Fulfilment
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {group.methods.map((method) => {
                        const selected =
                          setting?.fulfilmentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() =>
                              updateSetting(group.storeId, {
                                fulfilmentMethod: method,
                              })
                            }
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                              selected
                                ? "border-gold bg-gold/10 text-ink dark:text-neutral-100"
                                : "border-black/10 text-neutral-600 hover:border-gold/50 dark:border-white/10 dark:text-neutral-300"
                            }`}
                          >
                            {selected ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-dark dark:text-gold-light" />
                            ) : (
                              <span className="h-4 w-4 shrink-0 rounded-full border border-neutral-300 dark:border-neutral-600" />
                            )}
                            {FULFILMENT_LABELS[method] ?? method}
                          </button>
                        );
                      })}
                    </div>

                    {setting?.fulfilmentMethod === "delivery" ? (
                      <div className="mt-4">
                        <FormField
                          label="Delivery address"
                          htmlFor={`address-${group.storeId}`}
                        >
                          <textarea
                            id={`address-${group.storeId}`}
                            rows={2}
                            value={setting.deliveryAddress}
                            onChange={(event) =>
                              updateSetting(group.storeId, {
                                deliveryAddress: event.target.value,
                              })
                            }
                            placeholder="Hostel, room number and campus landmark"
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                    ) : setting?.fulfilmentMethod === "campus_pickup" &&
                      group.storePickupLocation ? (
                      <p className="mt-3 flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        Pickup: {group.storePickupLocation}
                      </p>
                    ) : null}

                    <div className="mt-4">
                      <FormField
                        label="Note for this seller (optional)"
                        htmlFor={`note-${group.storeId}`}
                      >
                        <textarea
                          id={`note-${group.storeId}`}
                          rows={2}
                          value={setting?.note ?? ""}
                          onChange={(event) =>
                            updateSetting(group.storeId, {
                              note: event.target.value,
                            })
                          }
                          placeholder="Any instructions, preferred time or size"
                          className={inputClass}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
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
              <div className="flex justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                <dt>Stores</dt>
                <dd>{groups.length}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-black/5 pt-2 text-base font-extrabold text-ink dark:border-white/10 dark:text-neutral-100">
                <dt>Total</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
            >
              {loading ? "Placing order..." : "Place order"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
              Payment is arranged directly with each seller. Your order is
              created as unpaid and the seller will confirm payment and
              fulfilment.
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
