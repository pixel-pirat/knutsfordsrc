"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Package, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MarketplaceProduct } from "@/db/schema";
import { PRODUCT_AVAILABILITY_LABELS } from "@/lib/marketplace";

type Draft = {
  stockQuantity: string;
  lowStockThreshold: string;
};

export function InventoryClient({
  products,
  canManage,
}: {
  products: MarketplaceProduct[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      products.map((product) => [
        product.id,
        {
          stockQuantity: String(product.stockQuantity),
          lowStockThreshold: String(product.lowStockThreshold),
        },
      ])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lowOnly, setLowOnly] = useState(false);

  const lowStockCount = products.filter(
    (product) =>
      product.availability === "ready_stock" &&
      product.stockQuantity <= product.lowStockThreshold
  ).length;

  const visibleProducts = lowOnly
    ? products.filter(
        (product) =>
          product.availability === "ready_stock" &&
          product.stockQuantity <= product.lowStockThreshold
      )
    : products;

  function setDraft(id: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  async function save(product: MarketplaceProduct) {
    const draft = drafts[product.id];
    if (!draft) return;
    setSavingId(product.id);
    setSavedId(null);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/inventory/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockQuantity: Number(draft.stockQuantity) || 0,
          lowStockThreshold: Number(draft.lowStockThreshold) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update stock.");
        return;
      }
      setSavedId(product.id);
      router.refresh();
    } catch {
      setError("Could not update stock. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Keep stock levels accurate so buyers know what is available
          </p>
        </div>
        {lowStockCount > 0 && (
          <button
            type="button"
            onClick={() => setLowOnly((value) => !value)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              lowOnly
                ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400"
                : "border-black/10 text-neutral-600 hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {lowStockCount} low stock
          </button>
        )}
      </div>

      {!canManage && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900">
          Your store is not currently editable. Contact the SRC for help.
        </p>
      )}

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
            <Package className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink dark:text-neutral-100">
            No products to track
          </p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            Add a product first, then you can manage its stock here.
          </p>
          <Link
            href="/dashboard/store/products"
            className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-gold dark:text-ink"
          >
            Go to products
          </Link>
        </div>
      ) : visibleProducts.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-neutral-500 ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-white/10">
          No products are low on stock right now.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleProducts.map((product) => {
            const draft = drafts[product.id] ?? {
              stockQuantity: String(product.stockQuantity),
              lowStockThreshold: String(product.lowStockThreshold),
            };
            const outOfStock =
              product.availability === "ready_stock" &&
              product.stockQuantity === 0;
            const lowStock =
              product.availability === "ready_stock" &&
              product.stockQuantity > 0 &&
              product.stockQuantity <= product.lowStockThreshold;

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink dark:text-neutral-100">
                        {product.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          outOfStock
                            ? "border-red-200 bg-red-50 text-red-700"
                            : lowStock
                              ? "border-orange-200 bg-orange-50 text-orange-700"
                              : "border-green-200 bg-green-50 text-green-700"
                        }
                      >
                        {outOfStock
                          ? "Out of stock"
                          : lowStock
                            ? "Low stock"
                            : "In stock"}
                      </Badge>
                      {!product.published && (
                        <Badge
                          variant="outline"
                          className="border-neutral-200 bg-neutral-100 text-neutral-500"
                        >
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {product.category} ·{" "}
                      {PRODUCT_AVAILABILITY_LABELS[product.availability] ??
                        product.availability}
                      {savedId === product.id ? " · Saved" : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label
                        htmlFor={`qty-${product.id}`}
                        className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
                      >
                        Quantity
                      </label>
                      <Input
                        id={`qty-${product.id}`}
                        type="number"
                        min="0"
                        step="1"
                        className="mt-1 h-8 w-24"
                        value={draft.stockQuantity}
                        disabled={!canManage}
                        onChange={(e) =>
                          setDraft(product.id, {
                            stockQuantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`low-${product.id}`}
                        className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
                      >
                        Low at
                      </label>
                      <Input
                        id={`low-${product.id}`}
                        type="number"
                        min="0"
                        step="1"
                        className="mt-1 h-8 w-24"
                        value={draft.lowStockThreshold}
                        disabled={!canManage}
                        onChange={(e) =>
                          setDraft(product.id, {
                            lowStockThreshold: e.target.value,
                          })
                        }
                      />
                    </div>
                    {canManage && (
                      <Button
                        size="sm"
                        onClick={() => save(product)}
                        disabled={savingId === product.id}
                      >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        {savingId === product.id ? "Saving…" : "Save"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
