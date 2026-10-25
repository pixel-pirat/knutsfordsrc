"use client";

import { useSyncExternalStore } from "react";
import type { MarketplaceListingType } from "@/lib/marketplace";

const CART_KEY = "knutsford-market-cart-v1";
const EMPTY_CART: CartItem[] = [];

export type CartItem = {
  key: string;
  type: MarketplaceListingType;
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeFulfilmentMethods: string[];
  storePickupLocation: string | null;
};

export type CartItemInput = Omit<CartItem, "key" | "quantity"> & {
  quantity?: number;
};

let cache: CartItem[] = EMPTY_CART;
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null;

  const type =
    value.type === "product" || value.type === "service" ? value.type : null;
  const id = asString(value.id);
  const name = asString(value.name);
  const price = asNumber(value.price);
  const quantity = asNumber(value.quantity);
  const maxQuantity = asNumber(value.maxQuantity);
  const storeId = asString(value.storeId);
  const storeName = asString(value.storeName);
  const storeSlug = asString(value.storeSlug);
  const methods = Array.isArray(value.storeFulfilmentMethods)
    ? value.storeFulfilmentMethods.filter(
        (method): method is string => typeof method === "string"
      )
    : [];

  if (
    !type ||
    !id ||
    !name ||
    price === null ||
    price < 0 ||
    quantity === null ||
    quantity < 1 ||
    maxQuantity === null ||
    maxQuantity < 1 ||
    !storeId ||
    !storeName ||
    !storeSlug
  ) {
    return null;
  }

  return {
    key: `${type}:${id}`,
    type,
    id,
    name,
    price,
    imageUrl: asString(value.imageUrl),
    quantity: Math.min(Math.max(Math.round(quantity), 1), Math.round(maxQuantity)),
    maxQuantity: Math.max(1, Math.round(maxQuantity)),
    storeId,
    storeName,
    storeSlug,
    storeFulfilmentMethods: methods,
    storePickupLocation: asString(value.storePickupLocation),
  };
}

function readCart() {
  if (typeof window === "undefined") return EMPTY_CART;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CART_KEY);
  } catch {
    return EMPTY_CART;
  }

  if (raw === cacheRaw) return cache;
  cacheRaw = raw;

  if (!raw) {
    cache = EMPTY_CART;
    return cache;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cache = EMPTY_CART;
      return cache;
    }
    const items = parsed
      .map(normalizeItem)
      .filter((item): item is CartItem => item !== null);
    cache = items.length > 0 ? items : EMPTY_CART;
    return cache;
  } catch {
    cache = EMPTY_CART;
    return cache;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function writeCart(items: CartItem[]) {
  cache = items.length > 0 ? items : EMPTY_CART;
  const raw = JSON.stringify(cache);
  cacheRaw = raw;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CART_KEY, raw);
    } catch {
      // Keep the in-memory cart usable if storage is unavailable.
    }
  }

  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key === CART_KEY) {
      cacheRaw = null;
      listener();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function addCartItem(input: CartItemInput) {
  const maxQuantity = Math.max(1, Math.round(input.maxQuantity));
  const quantity = Math.min(
    Math.max(Math.round(input.quantity ?? 1), 1),
    maxQuantity
  );
  const key = `${input.type}:${input.id}`;
  const items = readCart();
  const existing = items.find((item) => item.key === key);

  if (existing) {
    writeCart(
      items.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.min(item.quantity + quantity, maxQuantity),
              maxQuantity,
              price: input.price,
              name: input.name,
              imageUrl: input.imageUrl,
              storeFulfilmentMethods: input.storeFulfilmentMethods,
              storePickupLocation: input.storePickupLocation,
            }
          : item
      )
    );
    return;
  }

  writeCart([
    ...items,
    {
      ...input,
      key,
      imageUrl: input.imageUrl,
      quantity,
      maxQuantity,
    },
  ]);
}

export function updateCartQuantity(key: string, quantity: number) {
  const items = readCart();
  writeCart(
    items.map((item) =>
      item.key === key
        ? {
            ...item,
            quantity: Math.min(
              Math.max(Math.round(quantity), 1),
              item.maxQuantity
            ),
          }
        : item
    )
  );
}

export function removeCartItem(key: string) {
  writeCart(readCart().filter((item) => item.key !== key));
}

export function clearCart() {
  writeCart([]);
}

export function getCartSnapshot() {
  return readCart();
}

export function getCartServerSnapshot() {
  return EMPTY_CART;
}

export function useMarketCart() {
  const items = useSyncExternalStore(
    subscribe,
    getCartSnapshot,
    getCartServerSnapshot
  );

  return {
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: Math.round(
      items.reduce((total, item) => total + item.price * item.quantity, 0) * 100
    ) / 100,
    addItem: addCartItem,
    removeItem: removeCartItem,
    updateQuantity: updateCartQuantity,
    clear: clearCart,
  };
}
