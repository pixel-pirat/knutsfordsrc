"use client";

import { useState } from "react";
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
import { AnnouncementDialog, type AnnouncementRow } from "./AnnouncementDialog";

export function AnnouncementsClient({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const activeItems = announcements.filter((a) => a.active);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: AnnouncementRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  async function toggleActive(row: AnnouncementRow) {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/announcements/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !row.active }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= announcements.length) return;
    const ids = announcements.map((a) => a.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setReordering(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) router.refresh();
    } finally {
      setReordering(false);
    }
  }

  async function handleDelete(row: AnnouncementRow) {
    if (!confirm(`Remove "${row.text}" from the ticker? This can't be undone.`)) return;
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/announcements/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Control the headlines that scroll in the LATEST ticker on the homepage
          </p>
        </div>
        <Button onClick={openCreate}>New Announcement</Button>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-stretch bg-ink">
          <div className="flex shrink-0 items-center gap-2 bg-gold px-5 text-xs font-bold tracking-wide text-ink sm:px-6 sm:text-sm">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M4 4h9l3 3-3 3H4V4zm0 8h2v6H4v-6z" />
            </svg>
            LATEST
          </div>
          <div className="flex min-w-0 flex-1 items-center overflow-hidden px-5 py-3.5">
            {activeItems.length === 0 ? (
              <span className="truncate text-sm text-neutral-400">
                Nothing is showing — add an announcement or switch one on.
              </span>
            ) : (
              <div className="flex min-w-0 items-center gap-4 overflow-hidden whitespace-nowrap text-sm text-neutral-200">
                {activeItems.map((item) => (
                  <span key={item.id} className="flex items-center gap-4">
                    <span className="truncate">{item.text}</span>
                    <span className="text-gold">&#9679;</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Order</TableHead>
              <TableHead>Headline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-neutral-400 dark:text-neutral-500"
                >
                  No announcements yet. The homepage currently shows the default
                  headlines — add your first announcement to take over the ticker.
                </TableCell>
              </TableRow>
            )}
            {announcements.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || reordering}
                      className="rounded px-1.5 py-0.5 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-white/10"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === announcements.length - 1 || reordering}
                      className="rounded px-1.5 py-0.5 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-white/10"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-ink dark:text-neutral-100">
                  {row.text}
                  {row.linkUrl && (
                    <span className="block text-xs font-normal text-neutral-400 dark:text-neutral-500">
                      → {row.linkUrl}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      row.active
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {row.active ? "Live" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleActive(row)}
                      disabled={busyId === row.id}
                      className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline disabled:opacity-60"
                    >
                      {row.active ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      disabled={busyId === row.id}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                    >
                      {busyId === row.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AnnouncementDialog
        announcement={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
