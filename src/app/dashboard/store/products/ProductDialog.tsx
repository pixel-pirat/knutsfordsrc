"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import type { MarketplaceProduct } from "@/db/schema";
import {
  FULFILMENT_LABELS,
  MODERATION_STATUS_LABELS,
  PRODUCT_AVAILABILITY_LABELS,
} from "@/lib/marketplace";
import { productListingSchema } from "@/lib/validation";

const AVAILABILITY_OPTIONS = [
  "ready_stock",
  "preorder",
  "made_to_order",
] as const;
const FULFILMENT_OPTIONS = [
  "campus_pickup",
  "delivery",
  "digital",
  "service_appointment",
] as const;

type FormState = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  availability: (typeof AVAILABILITY_OPTIONS)[number];
  fulfilmentMethods: string[];
  published: boolean;
  resubmit: boolean;
};

function formFromProduct(product: MarketplaceProduct | null, defaults: string[]): FormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    imageUrl: product?.imageUrl ?? "",
    price: product?.price ?? "",
    discountPrice: product?.discountPrice ?? "",
    stockQuantity: product ? String(product.stockQuantity) : "0",
    lowStockThreshold: product ? String(product.lowStockThreshold) : "5",
    availability: product?.availability ?? "ready_stock",
    fulfilmentMethods: product?.fulfilmentMethods?.length
      ? product.fulfilmentMethods
      : defaults.length
        ? defaults
        : ["campus_pickup"],
    published: product?.published ?? true,
    resubmit: false,
  };
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
  defaultFulfilmentMethods,
}: {
  product: MarketplaceProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultFulfilmentMethods: string[];
}) {
  const router = useRouter();
  const openKey = open ? (product?.id ?? "create") : null;
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    formFromProduct(product, defaultFulfilmentMethods)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setForm(formFromProduct(product, defaultFulfilmentMethods));
      setError(null);
    }
  }

  const isBlocked =
    !!product && product.moderationStatus !== "active";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleFulfilment(method: string) {
    setForm((current) => ({
      ...current,
      fulfilmentMethods: current.fulfilmentMethods.includes(method)
        ? current.fulfilmentMethods.filter((m) => m !== method)
        : [...current.fulfilmentMethods, method],
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      imageUrl: form.imageUrl || undefined,
      price: Number(form.price),
      discountPrice:
        form.discountPrice.trim() === "" ? null : Number(form.discountPrice),
      stockQuantity: Number(form.stockQuantity) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
      availability: form.availability,
      fulfilmentMethods: form.fulfilmentMethods,
      published: form.published,
      resubmit: form.resubmit,
    };

    const parsed = productListingSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        product
          ? `/api/marketplace/products/${product.id}`
          : "/api/marketplace/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save the product.");
        return;
      }
      onSuccess?.();
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Could not save the product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit product" : "New product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update your product details, price and stock."
              : "Add a product listing to your storefront."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            imageUrl={form.imageUrl}
            onUploaded={(url) => setField("imageUrl", url)}
            onRemove={() => setField("imageUrl", "")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product-name">Product name</Label>
              <Input
                id="product-name"
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. A4 Notebook"
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                className="mt-1.5"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="e.g. Stationery"
                maxLength={60}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              className="mt-1.5"
              rows={3}
              maxLength={3000}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe the product, condition and what buyers should know"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product-price">Price (GHS)</Label>
              <Input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                className="mt-1.5"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="product-discount">Discount price (optional)</Label>
              <Input
                id="product-discount"
                type="number"
                min="0"
                step="0.01"
                className="mt-1.5"
                value={form.discountPrice}
                onChange={(e) => setField("discountPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="product-stock">Stock quantity</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                className="mt-1.5"
                value={form.stockQuantity}
                onChange={(e) => setField("stockQuantity", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="product-low">Low stock alert</Label>
              <Input
                id="product-low"
                type="number"
                min="0"
                step="1"
                className="mt-1.5"
                value={form.lowStockThreshold}
                onChange={(e) => setField("lowStockThreshold", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="product-availability">Availability</Label>
              <select
                id="product-availability"
                value={form.availability}
                onChange={(e) =>
                  setField(
                    "availability",
                    e.target.value as FormState["availability"]
                  )
                }
                className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {AVAILABILITY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {PRODUCT_AVAILABILITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Fulfilment methods</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {FULFILMENT_OPTIONS.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-neutral-700 dark:border-white/10 dark:text-neutral-300"
                >
                  <input
                    type="checkbox"
                    checked={form.fulfilmentMethods.includes(method)}
                    onChange={() => toggleFulfilment(method)}
                  />
                  {FULFILMENT_LABELS[method]}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setField("published", e.target.checked)}
            />
            Publish this product on my storefront
          </label>

          {isBlocked && (
            <div className="space-y-2 rounded-xl bg-orange-50 px-3 py-2.5 text-xs text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
              <p>
                This listing is currently{" "}
                {MODERATION_STATUS_LABELS[product.moderationStatus].toLowerCase()}.
                {product.moderationReason
                  ? ` Reason: ${product.moderationReason}`
                  : ""}
              </p>
              <label className="flex items-start gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.resubmit}
                  onChange={(e) => setField("resubmit", e.target.checked)}
                />
                Resubmit for SRC review after saving
              </label>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : product ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
