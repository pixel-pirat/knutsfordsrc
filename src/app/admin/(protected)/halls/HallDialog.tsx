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
import { ImageUpload } from "@/components/ImageUpload";
import { hallSchema } from "@/lib/validation";

type FormState = {
  name: string;
  description: string;
  wardenName: string;
  location: string;
  contactEmail: string;
  capacity: string;
  imageUrl: string;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  wardenName: "",
  location: "",
  contactEmail: "",
  capacity: "",
  imageUrl: "",
  active: true,
};

export function HallDialog({
  hallId,
  open,
  onOpenChange,
  onSuccess,
}: {
  hallId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = hallId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (hallId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (hallId) {
        setLoading(true);
      } else {
        setForm(emptyForm);
      }
    }
  }

  useEffect(() => {
    if (!open || !hallId) return;
    fetch(`/api/admin/halls/${hallId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.hall.name,
          description: data.hall.description ?? "",
          wardenName: data.hall.wardenName ?? "",
          location: data.hall.location ?? "",
          contactEmail: data.hall.contactEmail ?? "",
          capacity: data.hall.capacity != null ? String(data.hall.capacity) : "",
          imageUrl: data.hall.imageUrl ?? "",
          active: data.hall.active,
        });
      })
      .finally(() => setLoading(false));
  }, [open, hallId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = hallSchema.safeParse({
      ...form,
      capacity: form.capacity === "" ? undefined : form.capacity,
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
        mode === "create" ? "/api/admin/halls" : `/api/admin/halls/${hallId}`,
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Hall" : "Edit Hall"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            Loading…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              imageUrl={form.imageUrl}
              onUploaded={(url) => setField("imageUrl", url)}
              onRemove={() => setField("imageUrl", "")}
            />

            <div>
              <Label htmlFor="hall-name">Hall Name</Label>
              <Input
                id="hall-name"
                className="mt-1.5"
                placeholder="e.g. Unity Hall"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="hall-description">Description</Label>
              <Textarea
                id="hall-description"
                className="mt-1.5"
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hall-warden">Warden / Hall Master</Label>
                <Input
                  id="hall-warden"
                  className="mt-1.5"
                  value={form.wardenName}
                  onChange={(e) => setField("wardenName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hall-location">Location</Label>
                <Input
                  id="hall-location"
                  className="mt-1.5"
                  placeholder="e.g. Block B"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hall-email">Contact Email</Label>
                <Input
                  id="hall-email"
                  type="email"
                  className="mt-1.5"
                  value={form.contactEmail}
                  onChange={(e) => setField("contactEmail", e.target.value)}
                />
                {fieldErrors.contactEmail && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.contactEmail}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="hall-capacity">Capacity</Label>
                <Input
                  id="hall-capacity"
                  type="number"
                  min={0}
                  className="mt-1.5"
                  value={form.capacity}
                  onChange={(e) => setField("capacity", e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              Active (students can be assigned to this hall)
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
                {submitting ? "Saving…" : mode === "create" ? "Create Hall" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
