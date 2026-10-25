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
import type { MarketplaceService } from "@/db/schema";
import {
  MODERATION_STATUS_LABELS,
  SERVICE_DELIVERY_LABELS,
} from "@/lib/marketplace";
import { serviceListingSchema } from "@/lib/validation";

const DELIVERY_OPTIONS = ["physical", "virtual", "on_campus"] as const;

type FormState = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: string;
  pricingUnit: string;
  durationMinutes: string;
  availability: string;
  bookingRequired: boolean;
  deliveryMethod: (typeof DELIVERY_OPTIONS)[number];
  published: boolean;
  resubmit: boolean;
};

function formFromService(service: MarketplaceService | null): FormState {
  return {
    name: service?.name ?? "",
    description: service?.description ?? "",
    category: service?.category ?? "",
    imageUrl: service?.imageUrl ?? "",
    price: service?.price ?? "",
    pricingUnit: service?.pricingUnit ?? "",
    durationMinutes:
      service?.durationMinutes != null ? String(service.durationMinutes) : "",
    availability: service?.availability ?? "",
    bookingRequired: service?.bookingRequired ?? true,
    deliveryMethod: service?.deliveryMethod ?? "on_campus",
    published: service?.published ?? true,
    resubmit: false,
  };
}

export function ServiceDialog({
  service,
  open,
  onOpenChange,
  onSuccess,
}: {
  service: MarketplaceService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const openKey = open ? (service?.id ?? "create") : null;
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => formFromService(service));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setForm(formFromService(service));
      setError(null);
    }
  }

  const isBlocked = !!service && service.moderationStatus !== "active";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
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
      pricingUnit: form.pricingUnit || "",
      durationMinutes:
        form.durationMinutes.trim() === ""
          ? null
          : Number(form.durationMinutes),
      availability: form.availability || "",
      bookingRequired: form.bookingRequired,
      deliveryMethod: form.deliveryMethod,
      published: form.published,
      resubmit: form.resubmit,
    };

    const parsed = serviceListingSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        service
          ? `/api/marketplace/services/${service.id}`
          : "/api/marketplace/services",
        {
          method: service ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save the service.");
        return;
      }
      onSuccess?.();
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Could not save the service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit service" : "New service"}
          </DialogTitle>
          <DialogDescription>
            {service
              ? "Update the details, pricing and availability of this service."
              : "Offer a service to students on your storefront."}
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
              <Label htmlFor="service-name">Service name</Label>
              <Input
                id="service-name"
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Hair braiding"
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="service-category">Category</Label>
              <Input
                id="service-category"
                className="mt-1.5"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="e.g. Beauty"
                maxLength={60}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              className="mt-1.5"
              rows={3}
              maxLength={3000}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe what the service includes and how it is delivered"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="service-price">Price (GHS)</Label>
              <Input
                id="service-price"
                type="number"
                min="0.01"
                step="0.01"
                className="mt-1.5"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="service-unit">Pricing unit</Label>
              <Input
                id="service-unit"
                className="mt-1.5"
                value={form.pricingUnit}
                onChange={(e) => setField("pricingUnit", e.target.value)}
                placeholder="e.g. per session"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="service-duration">Duration (minutes)</Label>
              <Input
                id="service-duration"
                type="number"
                min="0"
                step="1"
                className="mt-1.5"
                value={form.durationMinutes}
                onChange={(e) => setField("durationMinutes", e.target.value)}
                placeholder="e.g. 60"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="service-availability">Availability</Label>
              <Input
                id="service-availability"
                className="mt-1.5"
                value={form.availability}
                onChange={(e) => setField("availability", e.target.value)}
                placeholder="e.g. Weekdays after 4pm"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="service-delivery">Delivery method</Label>
              <select
                id="service-delivery"
                value={form.deliveryMethod}
                onChange={(e) =>
                  setField(
                    "deliveryMethod",
                    e.target.value as FormState["deliveryMethod"]
                  )
                }
                className="mt-1.5 h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {DELIVERY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {SERVICE_DELIVERY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.bookingRequired}
              onChange={(e) => setField("bookingRequired", e.target.checked)}
            />
            Customers must book or schedule this service
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setField("published", e.target.checked)}
            />
            Publish this service on my storefront
          </label>

          {isBlocked && (
            <div className="space-y-2 rounded-xl bg-orange-50 px-3 py-2.5 text-xs text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
              <p>
                This listing is currently{" "}
                {MODERATION_STATUS_LABELS[service.moderationStatus].toLowerCase()}.
                {service.moderationReason ? ` Reason: ${service.moderationReason}` : ""}
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
              {submitting ? "Saving…" : service ? "Save changes" : "Add service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
