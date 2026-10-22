"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { HallDialog } from "./HallDialog";

export type HallRow = {
  id: string;
  name: string;
  wardenName: string | null;
  location: string | null;
  capacity: number | null;
  active: boolean;
  memberCount: number;
  eventCount: number;
};

export function HallsTable({
  halls,
  canDelete,
}: {
  halls: HallRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openHall(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  async function handleDelete(hall: HallRow) {
    if (
      !confirm(
        `Delete "${hall.name}"? Its hall events and messages are removed too, and members will be unassigned. This can't be undone.`
      )
    )
      return;
    setDeletingId(hall.id);
    try {
      const res = await fetch(`/api/admin/halls/${hall.id}`, { method: "DELETE" });
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
            Halls
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Hall profiles and the students assigned to each hall
          </p>
        </div>
        <Button onClick={() => openHall(null)}>New Hall</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hall</TableHead>
              <TableHead>Warden</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {halls.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-neutral-400 dark:text-neutral-500"
                >
                  No halls yet — create your first hall profile.
                </TableCell>
              </TableRow>
            )}
            {halls.map((hall) => (
              <TableRow key={hall.id}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">
                  <Link
                    href={`/admin/halls/${hall.id}`}
                    className="hover:text-gold-dark dark:hover:text-gold-light hover:underline"
                  >
                    {hall.name}
                  </Link>
                  {hall.location && (
                    <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                      {hall.location}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {hall.wardenName ?? "—"}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {hall.memberCount}
                  {hall.capacity ? ` / ${hall.capacity}` : ""}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {hall.eventCount}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      hall.active
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {hall.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(hall)}
                        disabled={deletingId === hall.id}
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                      >
                        {deletingId === hall.id ? "Removing…" : "Remove"}
                      </button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openHall(hall.id)}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <HallDialog
        hallId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
