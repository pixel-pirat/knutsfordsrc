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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { hallEventSchema } from "@/lib/validation";

type FormState = {
  hallId: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  bookingRequired: boolean;
  imageUrl: string;
  published: boolean;
};

const emptyForm: FormState = {
  hallId: "",
  title: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: "",
  capacity: "",
  bookingRequired: true,
  imageUrl: "",
  published: true,
};

function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HallEventDialog({
  eventId,
  open,
  onOpenChange,
  onSuccess,
}: {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = eventId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [halls, setHalls] = useState<{ id: string; name: string }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (eventId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (eventId) {
        setLoading(true);
      } else {
        setForm(emptyForm);
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/halls/options")
      .then((res) => res.json())
      .then((data) => setHalls(data.halls ?? []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || !eventId) return;
    fetch(`/api/admin/hall-events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          hallId: data.event.hallId ?? "",
          title: data.event.title,
          description: data.event.description ?? "",
          location: data.event.location ?? "",
          startsAt: toDateTimeLocal(data.event.startsAt),
          endsAt: toDateTimeLocal(data.event.endsAt),
          capacity:
            data.event.capacity != null ? String(data.event.capacity) : "",
          bookingRequired: data.event.bookingRequired,
          imageUrl: data.event.imageUrl ?? "",
          published: data.event.published,
        });
      })
      .finally(() => setLoading(false));
  }, [open, eventId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = hallEventSchema.safeParse({
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
        mode === "create"
          ? "/api/admin/hall-events"
          : `/api/admin/hall-events/${eventId}`,
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
          <DialogTitle>
            {mode === "create" ? "New Hall Event" : "Edit Hall Event"}
          </DialogTitle>
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
              <Label>Hall</Label>
              <Select
                value={form.hallId || "ALL"}
                onValueChange={(v) => setField("hallId", v === "ALL" ? "" : (v ?? ""))}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select hall" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All halls (open to everyone)</SelectItem>
                  {halls.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="he-title">Title</Label>
              <Input
                id="he-title"
                className="mt-1.5"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="he-description">Description</Label>
              <Textarea
                id="he-description"
                className="mt-1.5"
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="he-location">Location</Label>
              <Input
                id="he-location"
                className="mt-1.5"
                placeholder="e.g. Hall Common Room"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="he-startsAt">Starts</Label>
                <Input
                  id="he-startsAt"
                  type="datetime-local"
                  className="mt-1.5"
                  value={form.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                />
                {fieldErrors.startsAt && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.startsAt}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="he-endsAt">Ends (optional)</Label>
                <Input
                  id="he-endsAt"
                  type="datetime-local"
                  className="mt-1.5"
                  value={form.endsAt}
                  onChange={(e) => setField("endsAt", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="he-capacity">
                  Capacity (optional)
                </Label>
                <Input
                  id="he-capacity"
                  type="number"
                  min={0}
                  className="mt-1.5"
                  value={form.capacity}
                  onChange={(e) => setField("capacity", e.target.value)}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
                  <input
                    type="checkbox"
                    checked={form.bookingRequired}
                    onChange={(e) => setField("bookingRequired", e.target.checked)}
                  />
                  Require booking
                </label>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setField("published", e.target.checked)}
              />
              Published (visible to students)
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
                {submitting ? "Saving…" : mode === "create" ? "Create Event" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
