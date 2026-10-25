"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketplaceService } from "@/db/schema";
import { formatCurrency } from "@/lib/permits";
import {
  MODERATION_STATUS_LABELS,
  MODERATION_STATUS_STYLES,
  SERVICE_DELIVERY_LABELS,
} from "@/lib/marketplace";
import { ServiceDialog } from "./ServiceDialog";

export function ServicesClient({
  services,
  canManage,
}: {
  services: MarketplaceService[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceService | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(service: MarketplaceService) {
    setEditing(service);
    setDialogOpen(true);
  }

  async function patchService(service: MarketplaceService) {
    setBusyId(service.id);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          category: service.category,
          imageUrl: service.imageUrl || undefined,
          price: Number(service.price),
          pricingUnit: service.pricingUnit ?? "",
          durationMinutes: service.durationMinutes,
          availability: service.availability ?? "",
          bookingRequired: service.bookingRequired,
          deliveryMethod: service.deliveryMethod,
          published: !service.published,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update the service.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update the service. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(service: MarketplaceService) {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setBusyId(service.id);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/services/${service.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete the service.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete the service. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Services
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage the services you offer to students
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add service
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

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
            <Wrench className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink dark:text-neutral-100">
            No services yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            Add a service such as tutoring, hair styling or delivery to start
            taking requests.
          </p>
          {canManage && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add service
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => {
            const blocked = service.moderationStatus !== "active";
            const isDraft = !service.published && !blocked;

            return (
              <div
                key={service.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    {service.imageUrl ? (
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                        <Wrench className="h-6 w-6" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-ink dark:text-neutral-100">
                        {service.name}
                      </p>
                      {blocked ? (
                        <Badge
                          variant="outline"
                          className={
                            MODERATION_STATUS_STYLES[service.moderationStatus]
                          }
                        >
                          {MODERATION_STATUS_LABELS[service.moderationStatus]}
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
                      {service.category} ·{" "}
                      {SERVICE_DELIVERY_LABELS[service.deliveryMethod] ??
                        service.deliveryMethod}
                      {service.durationMinutes
                        ? ` · ${service.durationMinutes} min`
                        : ""}
                      {service.bookingRequired ? " · Booking required" : ""}
                    </p>
                    {service.availability && (
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Available: {service.availability}
                      </p>
                    )}
                    {blocked && service.moderationReason && (
                      <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                        {service.moderationReason}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-ink dark:text-neutral-100">
                      {formatCurrency(service.price)}
                    </p>
                    {service.pricingUnit && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {service.pricingUnit}
                      </p>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 dark:border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(service)}
                      disabled={busyId === service.id}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => patchService(service)}
                      disabled={busyId === service.id}
                    >
                      {service.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(service)}
                      disabled={busyId === service.id}
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

      <ServiceDialog
        service={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
