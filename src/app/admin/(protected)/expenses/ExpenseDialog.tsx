"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { expenseSchema } from "@/lib/validation";

export type ExpenseRow = {
  id: string;
  description: string;
  amount: string;
  category: string | null;
  notes: string | null;
  incurredAt: string; // ISO date-time
};

type FormState = {
  description: string;
  amount: string;
  category: string;
  notes: string;
  incurredAt: string; // yyyy-mm-dd
};

function emptyForm(): FormState {
  return {
    description: "",
    amount: "",
    category: "",
    notes: "",
    incurredAt: new Date().toISOString().slice(0, 10),
  };
}

function formFromExpense(expense: ExpenseRow): FormState {
  return {
    description: expense.description,
    amount: expense.amount,
    category: expense.category ?? "",
    notes: expense.notes ?? "",
    incurredAt: expense.incurredAt.slice(0, 10),
  };
}

export function ExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSuccess,
}: {
  expense: ExpenseRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = expense ? "edit" : "create";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (expense?.id ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      setForm(expense ? formFromExpense(expense) : emptyForm());
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = expenseSchema.safeParse({
      ...form,
      incurredAt: form.incurredAt ? new Date(form.incurredAt) : undefined,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/expenses" : `/api/admin/expenses/${expense!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      onSuccess?.();
      onOpenChange(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Log Expense" : "Edit Expense"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exp-description">Description</Label>
            <Input
              id="exp-description"
              className="mt-1.5"
              placeholder="e.g. Office supplies"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exp-amount">Amount (GHS)</Label>
              <Input
                id="exp-amount"
                className="mt-1.5"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
              />
              {fieldErrors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.amount}</p>
              )}
            </div>
            <div>
              <Label htmlFor="exp-date">Date Incurred</Label>
              <Input
                id="exp-date"
                className="mt-1.5"
                type="date"
                value={form.incurredAt}
                onChange={(e) => setField("incurredAt", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="exp-category">Category (optional)</Label>
            <Input
              id="exp-category"
              className="mt-1.5"
              placeholder="e.g. Utilities, Supplies, Salaries"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="exp-notes">Notes (optional)</Label>
            <Textarea
              id="exp-notes"
              className="mt-1.5"
              rows={3}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </div>

          {formError && (
            <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : mode === "create" ? "Log Expense" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
