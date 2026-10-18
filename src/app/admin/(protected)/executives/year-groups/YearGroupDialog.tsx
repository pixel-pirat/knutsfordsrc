"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { yearGroupSchema } from "@/lib/validation";

type FormState = {
  label: string;
  description: string;
  active: boolean;
};

const emptyForm: FormState = { label: "", description: "", active: true };

export function YearGroupDialog({
  yearGroupId,
  open,
  onOpenChange,
  onSuccess,
}: {
  yearGroupId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = yearGroupId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (yearGroupId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (yearGroupId) {
        setLoading(true);
      } else {
        setForm(emptyForm);
      }
    }
  }

  useEffect(() => {
    if (!open || !yearGroupId) return;
    fetch(`/api/admin/executives/year-groups/${yearGroupId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          label: data.yearGroup.label,
          description: data.yearGroup.description ?? "",
          active: data.yearGroup.active,
        });
      })
      .finally(() => setLoading(false));
  }, [open, yearGroupId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = yearGroupSchema.safeParse(form);
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
        mode === "create"
          ? "/api/admin/executives/year-groups"
          : `/api/admin/executives/year-groups/${yearGroupId}`,
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
          <DialogTitle>{mode === "create" ? "New Year Group" : "Edit Year Group"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="yg-label">Label</Label>
              <Input
                id="yg-label"
                className="mt-1.5"
                placeholder="e.g. 2025/2026"
                value={form.label}
                onChange={(e) => setField("label", e.target.value)}
              />
              {fieldErrors.label && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.label}</p>
              )}
            </div>

            <div>
              <Label htmlFor="yg-description">Description</Label>
              <Textarea
                id="yg-description"
                className="mt-1.5"
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              Active (shown on the public Hall of Fame)
            </label>

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
                {submitting ? "Saving…" : mode === "create" ? "Create Year Group" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
