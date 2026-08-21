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
import { AdminDialog, type AdminRow } from "./AdminDialog";

export function AdminsManager({ initialAdmins }: { initialAdmins: AdminRow[] }) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<AdminRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openDialog(admin: AdminRow | null) {
    setSelected(admin);
    setDialogOpen(true);
  }

  function refresh() {
    router.refresh();
    fetch("/api/admin/admins")
      .then((res) => res.json())
      .then((data) => setAdmins(data.admins))
      .catch(() => {});
  }

  async function toggleActive(admin: AdminRow, e: React.MouseEvent) {
    e.stopPropagation();
    setTogglingId(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !admin.active }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, active: data.admin.active } : a))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">Admins</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage sub-admin accounts and what they can do
          </p>
        </div>
        <Button onClick={() => openDialog(null)}>New Admin</Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow
                key={a.id}
                className={a.role === "super_admin" ? "" : "cursor-pointer"}
                onClick={() => a.role !== "super_admin" && openDialog(a)}
              >
                <TableCell>
                  <p className="font-medium text-ink dark:text-neutral-100">{a.name}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{a.email}</p>
                </TableCell>
                <TableCell className="capitalize text-neutral-700 dark:text-neutral-300">
                  {a.role.replace("_", " ")}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {a.role === "super_admin"
                    ? "All permissions"
                    : a.permissions.length > 0
                      ? a.permissions.join(", ")
                      : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      a.active
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-500"
                    }
                  >
                    {a.active ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {a.role !== "super_admin" && (
                    <button
                      type="button"
                      onClick={(e) => toggleActive(a, e)}
                      disabled={togglingId === a.id}
                      className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline disabled:opacity-60"
                    >
                      {a.active ? "Deactivate" : "Reactivate"}
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminDialog
        admin={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refresh}
      />
    </div>
  );
}
