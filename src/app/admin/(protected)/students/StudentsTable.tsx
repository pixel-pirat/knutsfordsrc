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
};

export function StudentsTable({
  students,
  canCreate,
  initialQuery,
  page,
  totalPages,
  total,
}: {
  students: StudentRow[];
  canCreate: boolean;
  initialQuery: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openDialog(id: string | null) {
    setSelectedId(id);
    setDialogOpen(true);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/admin/students?${params.toString()}`);
  }

  function clearSearch() {
    setQuery("");
    router.push("/admin/students");
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

  return (
    <div>
      <Card className="w-full gap-0 overflow-hidden rounded-2xl border border-black/5 bg-white py-0 ring-0 dark:border-white/10 dark:bg-neutral-900">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-3.5">
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
          {canCreate && (
            <CardAction>
              <Button onClick={() => openDialog(null)}>
                <UserPlusIcon className="h-4 w-4" />
                Create Student
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="w-[26%] px-3.5">Student</TableHead>
                <TableHead className="w-[22%] px-3.5">Programme</TableHead>
                <TableHead className="w-[10%] px-3.5">Level</TableHead>
                <TableHead className="w-[24%] px-3.5">Email</TableHead>
                <TableHead className="w-[14%] px-3.5">Phone</TableHead>
                <TableHead className="w-[4%] px-3.5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-neutral-400 dark:text-neutral-500">
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
                  <TableCell className="px-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        name={`${s.firstName} ${s.lastName}`}
                        avatarUrl={s.avatarUrl}
                        size="sm"
                        className="h-8 w-8 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink dark:text-neutral-100">
                          {s.firstName} {s.lastName}
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
            searchParams={{ q: initialQuery || undefined }}
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
