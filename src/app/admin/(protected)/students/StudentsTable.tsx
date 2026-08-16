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
import { Input } from "@/components/ui/input";
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
};

export function StudentsTable({
  students,
  canCreate,
  initialQuery,
}: {
  students: StudentRow[];
  canCreate: boolean;
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleSuccess() {
    router.refresh();
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/admin/students?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="max-w-md flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by index number, name or email…"
          />
        </form>
        {canCreate && <Button onClick={() => setDialogOpen(true)}>Create Student</Button>}
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index Number</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-neutral-400">
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
                <TableCell className="font-medium text-ink">{s.indexNumber}</TableCell>
                <TableCell className="text-neutral-700">
                  {s.firstName} {s.lastName}
                </TableCell>
                <TableCell className="text-neutral-500">{s.email ?? "—"}</TableCell>
                <TableCell className="text-neutral-500">{s.phone ?? "—"}</TableCell>
                <TableCell className="text-neutral-500">{s.program ?? "—"}</TableCell>
                <TableCell className="text-neutral-500">{s.level ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StudentDialog
        studentId={null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
