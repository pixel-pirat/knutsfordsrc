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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfileDialog } from "./ProfileDialog";

type ProfileRow = {
  id: string;
  name: string;
  position: string;
  avatarUrl: string | null;
  yearGroup: { id: string; label: string } | null;
  adminUser: { id: string; name: string; email: string } | null;
};

export function ProfilesTable({
  profiles,
  yearGroups,
  admins,
  selectedYearGroupId,
}: {
  profiles: ProfileRow[];
  yearGroups: { id: string; label: string }[];
  admins: { id: string; name: string; email: string }[];
  selectedYearGroupId: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openProfile(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function handleYearGroupChange(value: string | null) {
    const params = new URLSearchParams();
    if (value && value !== "all") params.set("yearGroup", value);
    router.push(`/admin/executives/profiles?${params.toString()}`);
  }

  async function handleDelete(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Remove "${name}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/executives/profiles/${id}`, { method: "DELETE" });
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
            Executive Profiles
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Who&rsquo;s in each year group, and what they do
          </p>
        </div>
        <Button
          onClick={() => openProfile(null)}
          disabled={yearGroups.length === 0}
          title={yearGroups.length === 0 ? "Create a year group first" : undefined}
        >
          New Profile
        </Button>
      </div>

      <div className="mb-5">
        <Select value={selectedYearGroupId || "all"} onValueChange={handleYearGroupChange}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All year groups</SelectItem>
            {yearGroups.map((yg) => (
              <SelectItem key={yg.id} value={yg.id}>
                {yg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Executive</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Year Group</TableHead>
              <TableHead>Linked Account</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                  {yearGroups.length === 0 ? "Create a year group first." : "No profiles yet."}
                </TableCell>
              </TableRow>
            )}
            {profiles.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => openProfile(p.id)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={p.name} avatarUrl={p.avatarUrl} size="sm" className="h-8 w-8" />
                    <span className="font-medium text-ink dark:text-neutral-100">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-700 dark:text-neutral-300">{p.position}</TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {p.yearGroup?.label ?? "—"}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {p.adminUser ? p.adminUser.email : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(p.id, p.name, e)}
                    disabled={deletingId === p.id}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                  >
                    {deletingId === p.id ? "Removing…" : "Remove"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProfileDialog
        profileId={selectedId}
        defaultYearGroupId={selectedYearGroupId || yearGroups[0]?.id || ""}
        yearGroups={yearGroups}
        admins={admins}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
