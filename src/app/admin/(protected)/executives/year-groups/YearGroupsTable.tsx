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
import { YearGroupDialog } from "./YearGroupDialog";

type YearGroupRow = {
  id: string;
  label: string;
  description: string | null;
  active: boolean;
};

export function YearGroupsTable({ yearGroups }: { yearGroups: YearGroupRow[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openYearGroup(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, label: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (
      !confirm(
        `Delete "${label}"? This removes every profile and achievement in this year group too. This can't be undone.`
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/executives/year-groups/${id}`, { method: "DELETE" });
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
            Executive Year Groups
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Cohorts of executives, e.g. &ldquo;2025/2026&rdquo;
          </p>
        </div>
        <Button onClick={() => openYearGroup(null)}>New Year Group</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {yearGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                  No year groups yet.
                </TableCell>
              </TableRow>
            )}
            {yearGroups.map((yg) => (
              <TableRow key={yg.id} className="cursor-pointer" onClick={() => openYearGroup(yg.id)}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">{yg.label}</TableCell>
                <TableCell className="max-w-sm truncate text-neutral-500 dark:text-neutral-400">
                  {yg.description ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      yg.active
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {yg.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(yg.id, yg.label, e)}
                    disabled={deletingId === yg.id}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                  >
                    {deletingId === yg.id ? "Removing…" : "Remove"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <YearGroupDialog
        yearGroupId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
