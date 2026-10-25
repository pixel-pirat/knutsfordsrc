"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketplaceProduct } from "@/db/schema";
import { formatCurrency } from "@/lib/permits";
import {
  MODERATION_STATUS_LABELS,
  MODERATION_STATUS_STYLES,
  PRODUCT_AVAILABILITY_LABELS,
} from "@/lib/marketplace";
import { ProductDialog } from "./ProductDialog";

export function ProductsClient({
  products,
  canManage,
  defaultFulfilmentMethods,
}: {
  products: MarketplaceProduct[];
  canManage: boolean;
  defaultFulfilmentMethods: string[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(product: MarketplaceProduct) {
    setEditing(product);
    setDialogOpen(true);
  }

  async function patchProduct(
    product: MarketplaceProduct,
    overrides: Partial<{
      published: boolean;
      resubmit: boolean;
      moderationStatus: string;
    }>
  ) {
    setBusyId(product.id);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          category: product.category,
          imageUrl: product.imageUrl || undefined,
          price: Number(product.price),
          discountPrice: product.discountPrice
            ? Number(product.discountPrice)
            : null,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          availability: product.availability,
          fulfilmentMethods: product.fulfilmentMethods,
          published: product.published,
          ...overrides,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update the product.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update the product. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product: MarketplaceProduct) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setBusyId(product.id);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete the product.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete the product. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage the physical or digital products in your store
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </Button>
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
            No products yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            Add your first product with a price and stock quantity to start
            building your storefront.
          </p>
          {canManage && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add product
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const blocked = product.moderationStatus !== "active";
            const isDraft = !product.published && !blocked;
            const effectivePrice = product.discountPrice ?? product.price;
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
                <div className="flex flex-wrap items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                        <Package className="h-6 w-6" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink dark:text-neutral-100">
                        {product.name}
                      </p>
                      {blocked ? (
                        <Badge
                          variant="outline"
                          className={
                            MODERATION_STATUS_STYLES[product.moderationStatus]
                          }
                        >
                          {MODERATION_STATUS_LABELS[product.moderationStatus]}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            isDraft
                              ? "border-neutral-200 bg-neutral-100 text-neutral-500"
                              : "border-green-200 bg-green-50 text-green-700"
                          }
                        >
                          {isDraft ? "Draft" : "Live"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {product.category} ·{" "}
                      {PRODUCT_AVAILABILITY_LABELS[product.availability] ??
                        product.availability}
                    </p>
                    {blocked && product.moderationReason && (
                      <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                        {product.moderationReason}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-ink dark:text-neutral-100">
                      {formatCurrency(effectivePrice)}
                    </p>
                    {product.discountPrice && (
                      <p className="text-xs text-neutral-400 line-through dark:text-neutral-500">
                        {formatCurrency(product.price)}
                      </p>
                    )}
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        outOfStock
                          ? "text-red-600 dark:text-red-400"
                          : lowStock
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {product.availability !== "ready_stock"
                        ? PRODUCT_AVAILABILITY_LABELS[product.availability]
                        : outOfStock
                          ? "Out of stock"
                          : lowStock
                            ? `Low stock: ${product.stockQuantity}`
                            : `${product.stockQuantity} in stock`}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 dark:border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(product)}
                      disabled={busyId === product.id}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        patchProduct(product, {
                          published: !product.published,
                        })
                      }
                      disabled={busyId === product.id}
                    >
                      {product.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product)}
                      disabled={busyId === product.id}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ProductDialog
        product={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultFulfilmentMethods={defaultFulfilmentMethods}
      />
    </div>
  );
}
