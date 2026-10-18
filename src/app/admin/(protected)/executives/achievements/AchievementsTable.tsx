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
import { AchievementDialog } from "./AchievementDialog";

type AchievementRow = {
  id: string;
  title: string;
  achievedAt: string | null;
  yearGroup: { id: string; label: string } | null;
  profile: { id: string; name: string } | null;
};

export function AchievementsTable({
  achievements,
  yearGroups,
  profiles,
  selectedYearGroupId,
}: {
  achievements: AchievementRow[];
  yearGroups: { id: string; label: string }[];
  profiles: { id: string; name: string; yearGroupId: string }[];
  selectedYearGroupId: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAchievement(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function handleYearGroupChange(value: string | null) {
    const params = new URLSearchParams();
    if (value && value !== "all") params.set("yearGroup", value);
    router.push(`/admin/executives/achievements?${params.toString()}`);
  }

  async function handleDelete(id: string, title: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/executives/achievements/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Executive Achievements
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Notable wins, by year group or by person
          </p>
        </div>
        <Button
          onClick={() => openAchievement(null)}
          disabled={yearGroups.length === 0}
          title={yearGroups.length === 0 ? "Create a year group first" : undefined}
        >
          New Achievement
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
              <TableHead>Title</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Year Group</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-neutral-400 dark:text-neutral-500">
                  {yearGroups.length === 0 ? "Create a year group first." : "No achievements yet."}
                </TableCell>
              </TableRow>
            )}
            {achievements.map((a) => (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => openAchievement(a.id)}>
                <TableCell className="font-medium text-ink dark:text-neutral-100">{a.title}</TableCell>
                <TableCell className="text-neutral-700 dark:text-neutral-300">
                  {a.profile?.name ?? "Whole year group"}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {a.yearGroup?.label ?? "—"}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {formatDate(a.achievedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(a.id, a.title, e)}
                    disabled={deletingId === a.id}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                  >
                    {deletingId === a.id ? "Removing…" : "Remove"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AchievementDialog
        achievementId={selectedId}
        defaultYearGroupId={selectedYearGroupId || yearGroups[0]?.id || ""}
        yearGroups={yearGroups}
        profiles={profiles}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
