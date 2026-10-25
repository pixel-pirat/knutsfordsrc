"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  addCartItem,
  type CartItemInput,
} from "@/lib/marketCart";

export function AddToCartButton({
  item,
  label = "Add to cart",
}: {
  item: CartItemInput;
  label?: string;
}) {
  const outOfStock = item.maxQuantity < 1;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => {
        addCartItem(item);
        toast.success(`${item.name} added to your cart`);
      }}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-semibold text-white transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:bg-gold dark:text-ink dark:hover:bg-gold/90 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
    >
      <ShoppingBag className="h-3.5 w-3.5" />
      {outOfStock ? "Out of stock" : label}
    </button>
  );
}

export function PurchasePanel({ item }: { item: CartItemInput }) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = item.maxQuantity < 1;
  const maxQuantity = Math.max(1, item.maxQuantity);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-11 items-center rounded-lg border border-black/10 dark:border-white/10">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={outOfStock || quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex h-full w-10 items-center justify-center text-lg text-neutral-600 transition-colors hover:bg-black/[0.03] disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
          >
            -
          </button>
          <span className="w-9 text-center text-sm font-semibold text-ink dark:text-neutral-100">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={outOfStock || quantity >= maxQuantity}
            onClick={() =>
              setQuantity((value) => Math.min(maxQuantity, value + 1))
            }
            className="flex h-full w-10 items-center justify-center text-lg text-neutral-600 transition-colors hover:bg-black/[0.03] disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addCartItem({ ...item, quantity });
            toast.success(
              `${quantity} x ${item.name} added to your cart`
            );
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:bg-gold dark:text-ink dark:hover:bg-gold/90 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
        >
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>

      <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
        {outOfStock
          ? "This listing is currently unavailable."
          : item.maxQuantity <= 20
            ? `Up to ${maxQuantity} available per order`
            : "You can adjust quantities in your cart"}
      </p>
    </div>
  );
}
