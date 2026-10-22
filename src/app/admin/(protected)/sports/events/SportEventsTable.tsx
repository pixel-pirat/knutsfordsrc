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
import { SportEventDialog } from "./SportEventDialog";
import { ParticipationsDialog } from "./ParticipationsDialog";

export type SportEventRow = {
  id: string;
  title: string;
  sport: string;
  venue: string | null;
  startsAt: string;
  endsAt: string | null;
  published: boolean;
  registrationCount: number;
  confirmedCount: number;
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

export function SportEventsTable({ events }: { events: SportEventRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(
    () => searchParams.get("new") === "1"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [participationEvent, setParticipationEvent] =
    useState<SportEventRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEvent(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  async function handleDelete(e: React.MouseEvent, id: string, title: string) {
    e.stopPropagation();
    if (
      !confirm(
        `Delete "${title}"? Registrations and linked tournaments are affected. This can't be undone.`
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/sports/events/${id}`, {
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
            Sport Events
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Internal sports activities — confirm participation to feed tournaments
          </p>
        </div>
        <Button onClick={() => openEvent(null)}>New Sport Event</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Participation</TableHead>
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
                  No sport events yet.
                </TableCell>
              </TableRow>
            )}
            {events.map((event) => (
              <TableRow key={event.id} className="cursor-pointer" onClick={() => openEvent(event.id)}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">
                  {event.title}
                  {event.venue && (
                    <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                      {event.venue}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {event.sport}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {formatDateTime(event.startsAt)}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-ink dark:text-neutral-100">
                    {event.confirmedCount}
                  </span>{" "}
                  confirmed · {event.registrationCount} registered
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setParticipationEvent(event);
                      }}
                    >
                      Participants
                    </Button>
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

      <SportEventDialog
        eventId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
      <ParticipationsDialog
        event={participationEvent}
        open={Boolean(participationEvent)}
        onOpenChange={(open) => {
          if (!open) setParticipationEvent(null);
        }}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
