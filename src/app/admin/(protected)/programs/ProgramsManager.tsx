"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type ProgramRow = { id: string; name: string; active: boolean };

export function ProgramsManager({
  initialPrograms,
}: {
  initialPrograms: ProgramRow[];
}) {
  const router = useRouter();
  const [programs, setPrograms] = useState(initialPrograms);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Enter a programme name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setPrograms((prev) =>
        [...prev, { id: data.program.id, name: data.program.name, active: true }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setName("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(program: ProgramRow) {
    setDeletingId(program.id);
    try {
      const res = await fetch(`/api/admin/programs/${program.id}`, { method: "DELETE" });
      if (res.ok) {
        setPrograms((prev) => prev.filter((p) => p.id !== program.id));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Programmes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the list of programmes students can select from their profile
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex max-w-md flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="e.g. BSc Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add Programme"}
        </Button>
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programme</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="py-10 text-center text-neutral-400">
                  No programmes added yet.
                </TableCell>
              </TableRow>
            )}
            {programs.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-ink">{p.name}</TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                  >
                    {deletingId === p.id ? "Removing…" : "Remove"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
