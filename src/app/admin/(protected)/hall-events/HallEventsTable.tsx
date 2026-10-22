"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HallEventDialog } from "./HallEventDialog";
import { BookingsDialog } from "./BookingsDialog";

export type HallEventRow = {
  id: string;
  title: string;
  hallId: string | null;
  hallName: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  bookingRequired: boolean;
  published: boolean;
  bookingCount: number;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HallEventsTable({ events }: { events: HallEventRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(
    () => searchParams.get("new") === "1"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bookingsEvent, setBookingsEvent] = useState<HallEventRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEvent(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  async function handleDelete(e: React.MouseEvent, id: string, title: string) {
    e.stopPropagation();
    if (!confirm(`Delete "${title}"? Bookings are removed too. This can't be undone.`))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/hall-events/${id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Hall Events
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Events and programs for the halls — manage bookings and attendance
          </p>
        </div>
        <Button onClick={() => openEvent(null)}>New Hall Event</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Hall</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-neutral-400 dark:text-neutral-500"
                >
                  No hall events yet.
                </TableCell>
              </TableRow>
            )}
            {events.map((event) => (
              <TableRow key={event.id} className="cursor-pointer" onClick={() => openEvent(event.id)}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">
                  {event.title}
                  {event.location && (
                    <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                      {event.location}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {event.hallName ?? "All Halls"}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {formatDateTime(event.startsAt)}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {event.bookingRequired ? (
                    <span>
                      {event.bookingCount}
                      {event.capacity ? ` / ${event.capacity}` : ""}
                    </span>
                  ) : (
                    <span className="text-neutral-300 dark:text-neutral-600">No bookings</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      event.published
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {event.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {event.bookingRequired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingsEvent(event);
                        }}
                      >
                        Bookings
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, event.id, event.title)}
                      disabled={deletingId === event.id}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                    >
                      {deletingId === event.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <HallEventDialog
        eventId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
      <BookingsDialog
        event={bookingsEvent}
        open={Boolean(bookingsEvent)}
        onOpenChange={(open) => {
          if (!open) setBookingsEvent(null);
        }}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
