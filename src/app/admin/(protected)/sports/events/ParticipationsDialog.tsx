"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { SportEventRow } from "./SportEventsTable";

type Participation = {
  id: string;
  status: "registered" | "confirmed" | "declined";
  createdAt: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  program: string | null;
  hallName: string | null;
};

export function ParticipationsDialog({
  event,
  open,
  onOpenChange,
  onChanged,
}: {
  event: SportEventRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}) {
  const [rows, setRows] = useState<Participation[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reset + mark "needs load" when the dialog opens for an event
  // (adjust-state-during-render pattern, as used by the app's dialogs).
  const [pendingFor, setPendingFor] = useState<string | null>(null);
  const eventKey = open && event ? event.id : null;
  if (eventKey !== pendingFor) {
    setPendingFor(eventKey);
    if (eventKey) setRows(null);
  }

  useEffect(() => {
    if (!open || !event) return;
    if (rows !== null && pendingFor === event.id) return;
    let alive = true;
    fetch(`/api/admin/sports/events/${event.id}/participations`)
      .then((res) => res.json())
      .then((data) => {
        if (alive) setRows(data.participations ?? []);
      })
      .catch(() => {
        if (alive) setRows([]);
      });
    return () => {
      alive = false;
    };
  }, [open, event, rows, pendingFor]);

  async function setStatus(
    participationId: string,
    status: Participation["status"]
  ) {
    if (!event) return;
    setBusyId(participationId);
    try {
      const res = await fetch(
        `/api/admin/sports/events/${event.id}/participations`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participationId, status }),
        }
      );
      if (res.ok) {
        setRows((prev) =>
          prev
            ? prev.map((p) =>
                p.id === participationId ? { ...p, status } : p
              )
            : prev
        );
        onChanged?.();
      }
    } finally {
      setBusyId(null);
    }
  }

  const confirmed = rows?.filter((p) => p.status === "confirmed").length ?? 0;
  const pending = rows?.filter((p) => p.status === "registered").length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Participation — {event?.title ?? ""}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-ink dark:text-neutral-100">
            {confirmed}
          </span>{" "}
          confirmed · {pending} awaiting confirmation. Confirming a student enters
          them into the pairing pools for tournaments linked to this event.
        </p>

        <div className="rounded-xl ring-1 ring-black/5 dark:ring-white/10">
          {rows === null ? (
            <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              Loading…
            </p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No students have registered yet.
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {rows.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                      {p.firstName} {p.lastName}{" "}
                      {p.status === "confirmed" && (
                        <Badge
                          variant="outline"
                          className="ml-1 border-green-200 bg-green-50 text-green-700"
                        >
                          Confirmed
                        </Badge>
                      )}
                      {p.status === "declined" && (
                        <Badge
                          variant="outline"
                          className="ml-1 border-neutral-200 bg-neutral-100 text-neutral-500"
                        >
                          Declined
                        </Badge>
                      )}
                      {p.status === "registered" && (
                        <Badge
                          variant="outline"
                          className="ml-1 border-amber-200 bg-amber-50 text-amber-700"
                        >
                          Awaiting
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {p.indexNumber}
                      {p.hallName ? ` · ${p.hallName}` : ""}
                      {p.program ? ` · ${p.program}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {p.status !== "confirmed" && (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => setStatus(p.id, "confirmed")}
                        className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
                      >
                        Confirm
                      </button>
                    )}
                    {p.status === "registered" && (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => setStatus(p.id, "declined")}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 disabled:opacity-60"
                      >
                        Decline
                      </button>
                    )}
                    {p.status === "confirmed" && (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => setStatus(p.id, "registered")}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 disabled:opacity-60"
                      >
                        Undo
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
