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
import { EventDialog } from "./EventDialog";

type EventRow = {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  published: boolean;
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

export function EventsTable({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(() => searchParams.get("new") === "1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEvent(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, title: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">Events</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage the events shown on the student dashboard
          </p>
        </div>
        <Button onClick={() => openEvent(null)}>New Event</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                  No events yet.
                </TableCell>
              </TableRow>
            )}
            {events.map((event) => (
              <TableRow key={event.id} className="cursor-pointer" onClick={() => openEvent(event.id)}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">{event.title}</TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">{event.location ?? "—"}</TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {formatDateTime(event.startsAt)}
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
                  <button
                    type="button"
                    onClick={(e) => handleDelete(event.id, event.title, e)}
                    disabled={deletingId === event.id}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                  >
                    {deletingId === event.id ? "Removing…" : "Remove"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EventDialog
        eventId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
