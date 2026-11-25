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
import { Pagination } from "@/components/admin/Pagination";
import { PlusIcon } from "lucide-react";
import { formatCurrency } from "@/lib/permits";
import { ExpenseDialog, type ExpenseRow } from "./ExpenseDialog";

export function ExpensesTable({
  expenses,
  page,
  totalPages,
  total,
}: {
  expenses: (ExpenseRow & { creatorName: string | null })[];
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ExpenseRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openDialog(expense: ExpenseRow | null) {
    setSelected(expense);
    setDialogOpen(true);
  }

  async function handleDelete(expense: ExpenseRow) {
    if (!confirm(`Delete expense "${expense.description}"? This can't be undone.`)) return;
    setDeletingId(expense.id);
    try {
      const res = await fetch(`/api/admin/expenses/${expense.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <Card className="w-full gap-0 overflow-hidden rounded-2xl border border-black/5 bg-white py-0 ring-0 dark:border-white/10 dark:bg-neutral-900">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-3.5">
          <p className="text-sm font-semibold text-ink dark:text-neutral-100">All Expenses</p>
          <CardAction>
            <Button onClick={() => openDialog(null)}>
              <PlusIcon className="h-4 w-4" />
              Log Expense
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="md:table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="w-[26%] px-3.5">Description</TableHead>
                <TableHead className="hidden w-[15%] px-3.5 md:table-cell">Category</TableHead>
                <TableHead className="w-[13%] px-3.5">Amount</TableHead>
                <TableHead className="hidden w-[14%] px-3.5 md:table-cell">Date</TableHead>
                <TableHead className="hidden w-[16%] px-3.5 md:table-cell">Logged By</TableHead>
                <TableHead className="w-[16%] px-3.5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-neutral-400 dark:text-neutral-500">
                    No expenses logged yet.
                  </TableCell>
                </TableRow>
              )}
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="truncate px-3.5 font-medium text-ink dark:text-neutral-100">
                    {e.description}
                  </TableCell>
                  <TableCell className="hidden px-3.5 md:table-cell">
                    {e.category ? <Badge variant="outline">{e.category}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="px-3.5 text-neutral-700 dark:text-neutral-300">
                    {formatCurrency(e.amount)}
                  </TableCell>
                  <TableCell className="hidden px-3.5 text-neutral-500 md:table-cell dark:text-neutral-400">
                    {new Date(e.incurredAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="hidden truncate px-3.5 text-neutral-500 md:table-cell dark:text-neutral-400">
                    {e.creatorName ?? "—"}
                  </TableCell>
                  <TableCell className="px-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openDialog(e)}
                      className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(e)}
                      disabled={deletingId === e.id}
                      className="ml-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                    >
                      {deletingId === e.id ? "Removing…" : "Delete"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-none bg-transparent! p-3.5">
          <Pagination page={page} totalPages={totalPages} total={total} basePath="/admin/expenses" searchParams={{}} />
        </CardFooter>
      </Card>

      <ExpenseDialog
        expense={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
