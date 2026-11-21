"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/UserAvatar";
import { Pagination } from "@/components/admin/Pagination";
import { SearchIcon, XIcon, MoreHorizontalIcon, UserPlusIcon } from "lucide-react";
import { StudentDialog } from "./StudentDialog";

type StudentRow = {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  level: string | null;
  avatarUrl: string | null;
  hallName: string | null;
  archivedAt: string | null;
};

const ARCHIVED_OPTIONS = [
  { value: "active", label: "Active Students" },
  { value: "archived", label: "Archived (Graduated)" },
  { value: "all", label: "All Students" },
];

export function StudentsTable({
  students,
  canCreate,
  initialQuery,
  archived,
  page,
  totalPages,
  total,
}: {
  students: StudentRow[];
  canCreate: boolean;
  initialQuery: string;
  archived: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  function openDialog(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function navigate(nextQuery: string, nextArchived: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextArchived !== "active") params.set("archived", nextArchived);
    const qs = params.toString();
    router.push(qs ? `/admin/students?${qs}` : "/admin/students");
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(query, archived);
  }

  function clearSearch() {
    setQuery("");
    navigate("", archived);
  }

  async function handleDelete(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete ${name}? This also deletes their permits. This can't be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? students.map((s) => s.id) : []);
  }

  const selectedActiveIds = students
    .filter((s) => selectedIds.includes(s.id) && !s.archivedAt)
    .map((s) => s.id);
  const selectedArchivedIds = students
    .filter((s) => selectedIds.includes(s.id) && s.archivedAt)
    .map((s) => s.id);

  async function handleBulkArchive() {
    if (selectedActiveIds.length === 0) return;
    if (
      !confirm(
        `Archive ${selectedActiveIds.length} student${selectedActiveIds.length === 1 ? "" : "s"} as graduated? They will stop counting toward the active student count. This can be undone.`
      )
    )
      return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/students/bulk-archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedActiveIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        router.refresh();
      }
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkUnarchive() {
    if (selectedArchivedIds.length === 0) return;
    if (!confirm(`Unarchive ${selectedArchivedIds.length} student${selectedArchivedIds.length === 1 ? "" : "s"}?`))
      return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/students/bulk-unarchive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedArchivedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        router.refresh();
      }
    } finally {
      setBulkBusy(false);
    }
  }

  const allOnPageSelected = students.length > 0 && students.every((s) => selectedIds.includes(s.id));

  async function archiveOne(id: string) {
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/students/bulk-archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBulkBusy(false);
    }
  }

  async function unarchiveOne(id: string) {
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/students/bulk-unarchive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      <Card className="w-full gap-0 overflow-hidden rounded-2xl border border-black/5 bg-white py-0 ring-0 dark:border-white/10 dark:bg-neutral-900">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit}>
              <InputGroup className="w-64 dark:border-white/10 dark:bg-neutral-950">
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search by index number, name or email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query.length > 0 && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      aria-label="Clear"
                      title="Clear"
                      size="icon-xs"
                      onClick={clearSearch}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </form>
            <Select value={archived} onValueChange={(v) => v && navigate(query, v)}>
              <SelectTrigger className="h-9 w-auto min-w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARCHIVED_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canCreate && (
            <CardAction>
              <Button onClick={() => openDialog(null)}>
                <UserPlusIcon className="h-4 w-4" />
                Create Student
              </Button>
            </CardAction>
          )}
        </CardHeader>

        {canCreate && selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-t border-black/5 bg-gold/5 px-3.5 py-2.5 dark:border-white/10">
            <p className="text-sm font-medium text-ink dark:text-neutral-100">
              {selectedIds.length} selected
            </p>
            {selectedActiveIds.length > 0 && (
              <Button size="sm" variant="outline" disabled={bulkBusy} onClick={handleBulkArchive}>
                Archive {selectedActiveIds.length} as Graduated
              </Button>
            )}
            {selectedArchivedIds.length > 0 && (
              <Button size="sm" variant="outline" disabled={bulkBusy} onClick={handleBulkUnarchive}>
                Unarchive {selectedArchivedIds.length}
              </Button>
            )}
            <button
              type="button"
              className="text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </button>
          </div>
        )}

        <CardContent className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                {canCreate && (
                  <TableHead className="w-[4%] px-3.5">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      aria-label="Select all on page"
                    />
                  </TableHead>
                )}
                <TableHead className="w-[24%] px-3.5">Student</TableHead>
                <TableHead className="w-[16%] px-3.5">Programme</TableHead>
                <TableHead className="w-[8%] px-3.5">Level</TableHead>
                <TableHead className="w-[12%] px-3.5">Hall</TableHead>
                <TableHead className="w-[18%] px-3.5">Email</TableHead>
                <TableHead className="w-[12%] px-3.5">Phone</TableHead>
                <TableHead className="w-[4%] px-3.5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canCreate ? 8 : 7}
                    className="h-24 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              )}
              {students.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/students/${s.id}`)}
                >
                  {canCreate && (
                    <TableCell className="px-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={(e) => toggleSelected(s.id, e.target.checked)}
                        aria-label={`Select ${s.firstName} ${s.lastName}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="px-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        name={`${s.firstName} ${s.lastName}`}
                        avatarUrl={s.avatarUrl}
                        size="sm"
                        className="h-8 w-8 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium text-ink dark:text-neutral-100">
                          {s.firstName} {s.lastName}
                          {s.archivedAt && (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              Graduated
                            </Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
                          {s.indexNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="truncate px-3.5 text-neutral-700 dark:text-neutral-300">
                    {s.program ?? "—"}
                  </TableCell>
                  <TableCell className="truncate px-3.5 text-neutral-700 dark:text-neutral-300">
                    {s.level ?? "—"}
                  </TableCell>
                  <TableCell className="truncate px-3.5 text-neutral-700 dark:text-neutral-300">
                    {s.hallName ?? "—"}
                  </TableCell>
                  <TableCell className="truncate px-3.5 text-neutral-500 dark:text-neutral-400">
                    {s.email ?? "—"}
                  </TableCell>
                  <TableCell className="truncate px-3.5 text-neutral-500 dark:text-neutral-400">
                    {s.phone ?? "—"}
                  </TableCell>
                  <TableCell className="px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button className="size-7 cursor-pointer" size="icon" variant="ghost">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent side="bottom" align="end">
                        {canCreate && (
                          <DropdownMenuItem className="cursor-pointer" onClick={() => openDialog(s.id)}>
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push(`/admin/students/${s.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        {canCreate && (
                          <>
                            <DropdownMenuSeparator />
                            {s.archivedAt ? (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={bulkBusy}
                                onClick={() => unarchiveOne(s.id)}
                              >
                                Unarchive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={bulkBusy}
                                onClick={() => archiveOne(s.id)}
                              >
                                Archive as Graduated
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              variant="destructive"
                              className="cursor-pointer"
                              disabled={deletingId === s.id}
                              onClick={(e) => handleDelete(s.id, `${s.firstName} ${s.lastName}`, e)}
                            >
                              {deletingId === s.id ? "Removing…" : "Delete"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-none bg-transparent! p-3.5">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            basePath="/admin/students"
            searchParams={{ q: initialQuery || undefined, archived: archived !== "active" ? archived : undefined }}
          />
        </CardFooter>
      </Card>

      <StudentDialog
        studentId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
