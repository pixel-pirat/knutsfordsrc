"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { HallEventRow } from "./HallEventsTable";

type Booking = {
  id: string;
  status: "booked" | "attended" | "cancelled";
  bookedAt: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingsDialog({
  event,
  open,
  onOpenChange,
  onChanged,
}: {
  event: HallEventRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reset + mark "needs load" when the dialog opens for an event
  // (adjust-state-during-render pattern, as used by the app's dialogs).
  const [pendingFor, setPendingFor] = useState<string | null>(null);
  const eventKey = open && event ? event.id : null;
  if (eventKey !== pendingFor) {
    setPendingFor(eventKey);
    if (eventKey) setBookings(null);
  }

  useEffect(() => {
    if (!open || !event) return;
    if (bookings !== null && pendingFor === event.id) return;
    let alive = true;
    fetch(`/api/admin/hall-events/${event.id}/bookings`)
      .then((res) => res.json())
      .then((data) => {
        if (alive) setBookings(data.bookings ?? []);
      })
      .catch(() => {
        if (alive) setBookings([]);
      });
    return () => {
      alive = false;
    };
  }, [open, event, bookings, pendingFor]);

  async function setStatus(bookingId: string, status: Booking["status"]) {
    if (!event) return;
    setBusyId(bookingId);
    try {
      const res = await fetch(`/api/admin/hall-events/${event.id}/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev
            ? prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
            : prev
        );
        onChanged?.();
      }
    } finally {
      setBusyId(null);
    }
  }

  const active = bookings?.filter((b) => b.status !== "cancelled") ?? [];
  const attended = active.filter((b) => b.status === "attended").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bookings — {event?.title ?? ""}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {event?.capacity
            ? `${active.length} of ${event.capacity} seats booked · ${attended} attended`
            : `${active.length} bookings · ${attended} attended`}
        </p>

        <div className="rounded-xl ring-1 ring-black/5 dark:ring-white/10">
          {bookings === null ? (
            <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              Loading…
            </p>
          ) : bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No bookings yet.
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                      {b.firstName} {b.lastName}{" "}
                      {b.status === "cancelled" && (
                        <Badge
                          variant="outline"
                          className="ml-1 border-neutral-200 bg-neutral-100 text-neutral-500"
                        >
                          Cancelled
                        </Badge>
                      )}
                      {b.status === "attended" && (
                        <Badge
                          variant="outline"
                          className="ml-1 border-green-200 bg-green-50 text-green-700"
                        >
                          Attended
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {b.indexNumber} · booked {formatDateTime(b.bookedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {b.status !== "attended" && b.status !== "cancelled" && (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b.id, "attended")}
                        className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
                      >
                        Attended
                      </button>
                    )}
                    {b.status !== "cancelled" && b.status !== "attended" && (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b.id, "cancelled")}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    )}
                    {b.status === "cancelled" && (
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b.id, "booked")}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 disabled:opacity-60"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
