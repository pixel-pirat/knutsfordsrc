"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import type {
  MarketplaceApplication,
  MarketplaceStore,
} from "@/db/schema";
import { CATEGORY_LABELS, FULFILMENT_LABELS } from "@/lib/marketplace";
import type { StudentSummary } from "./types";

const CATEGORY_OPTIONS = ["products", "services", "both"] as const;
const FULFILMENT_OPTIONS = [
  "campus_pickup",
  "delivery",
  "digital",
  "service_appointment",
] as const;

export function StoreForm({
  mode,
  student,
  application,
  store,
}: {
  mode: "create" | "edit";
  student: StudentSummary;
  application?: MarketplaceApplication;
  store?: MarketplaceStore;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: store?.name ?? application?.storeName ?? "",
    description: store?.description ?? application?.description ?? "",
    category: store?.category ?? application?.category ?? "products",
    logoUrl: store?.logoUrl ?? "",
    contactEmail: store?.contactEmail ?? student.email ?? "",
    contactPhone: store?.contactPhone ?? application?.contactNumber ?? "",
    fulfilmentMethods:
      store?.fulfilmentMethods?.length
        ? store.fulfilmentMethods
        : application?.fulfilmentMethods?.length
          ? application.fulfilmentMethods
          : ["campus_pickup"],
    operatingHours: store?.operatingHours ?? "",
    pickupLocation: store?.pickupLocation ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleFulfilment(method: string) {
    setForm((current) => ({
      ...current,
      fulfilmentMethods: current.fulfilmentMethods.includes(method)
        ? current.fulfilmentMethods.filter((m) => m !== method)
        : [...current.fulfilmentMethods, method],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/store", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logoUrl: form.logoUrl || undefined,
          description: form.description || undefined,
          contactEmail: form.contactEmail || undefined,
          contactPhone: form.contactPhone || undefined,
          operatingHours: form.operatingHours || undefined,
          pickupLocation: form.pickupLocation || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save your store.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save your store. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <h2 className="text-sm font-bold text-ink dark:text-neutral-100">
        {mode === "create" ? "Set up your store" : "Store settings"}
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {mode === "create"
          ? "Your seller application is approved. Fill in your storefront details to go live."
          : "Keep your storefront details, contact information and availability up to date."}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label>Store logo</Label>
          <div className="mt-2">
            <ImageUpload
              imageUrl={form.logoUrl}
              onUploaded={(url) => setForm({ ...form, logoUrl: url })}
              onRemove={() => setForm({ ...form, logoUrl: "" })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shop-name">Store name</Label>
            <Input
              id="shop-name"
              className="mt-1.5"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="shop-category">Category</Label>
            <select
              id="shop-category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as typeof form.category,
                })
              }
              className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {CATEGORY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="shop-description">Store description</Label>
          <Textarea
            id="shop-description"
            className="mt-1.5"
            rows={3}
            maxLength={2000}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Introduce your store to customers"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shop-email">Contact email</Label>
            <Input
              id="shop-email"
              type="email"
              className="mt-1.5"
              value={form.contactEmail}
              onChange={(e) =>
                setForm({ ...form, contactEmail: e.target.value })
              }
              placeholder="store@example.com"
            />
          </div>
          <div>
            <Label htmlFor="shop-phone">Contact phone</Label>
            <Input
              id="shop-phone"
              className="mt-1.5"
              value={form.contactPhone}
              onChange={(e) =>
                setForm({ ...form, contactPhone: e.target.value })
              }
              maxLength={30}
            />
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shop-hours">Operating hours</Label>
            <Input
              id="shop-hours"
              className="mt-1.5"
              value={form.operatingHours}
              onChange={(e) =>
                setForm({ ...form, operatingHours: e.target.value })
              }
              placeholder="e.g. Mon–Fri, 9am–5pm"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="shop-pickup">Pickup location</Label>
            <Input
              id="shop-pickup"
              className="mt-1.5"
              value={form.pickupLocation}
              onChange={(e) =>
                setForm({ ...form, pickupLocation: e.target.value })
              }
              placeholder="e.g. Unity Hall reception"
              maxLength={200}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
            Store saved.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create store"
                : "Save changes"}
          </Button>
          {mode === "create" && (
            <Link
              href="/dashboard/market"
              className="text-sm font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
            >
              Back to marketplace
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
