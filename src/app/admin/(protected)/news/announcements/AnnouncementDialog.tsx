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
import { announcementSchema } from "@/lib/validation";

export type AnnouncementRow = {
  id: string;
  text: string;
  linkUrl: string | null;
  active: boolean;
};

type FormState = {
  text: string;
  linkUrl: string;
  active: boolean;
};

const emptyForm: FormState = {
  text: "",
  linkUrl: "",
  active: true,
};

export function AnnouncementDialog({
  announcement,
  open,
  onOpenChange,
  onSuccess,
}: {
  announcement: AnnouncementRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = announcement ? "edit" : "create";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openKey = open ? (announcement?.id ?? "create") : null;
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      setForm(
        announcement
          ? {
              text: announcement.text,
              linkUrl: announcement.linkUrl ?? "",
              active: announcement.active,
            }
          : emptyForm
      );
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = announcementSchema.safeParse(form);
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
        announcement
          ? `/api/admin/announcements/${announcement.id}`
          : "/api/admin/announcements",
        {
          method: announcement ? "PATCH" : "POST",
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
          <DialogTitle>
            {mode === "create" ? "New Announcement" : "Edit Announcement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="announcement-text">Headline</Label>
            <Textarea
              id="announcement-text"
              className="mt-1.5"
              rows={3}
              maxLength={200}
              placeholder="e.g. SRC opens nominations for the 2026 Online Voting cycle"
              value={form.text}
              onChange={(e) => setField("text", e.target.value)}
            />
            <div className="mt-1 flex items-center justify-between">
              {fieldErrors.text ? (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.text}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {form.text.length}/200
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="announcement-link">Link (optional)</Label>
            <Input
              id="announcement-link"
              className="mt-1.5"
              placeholder="/news or https://example.com"
              value={form.linkUrl}
              onChange={(e) => setField("linkUrl", e.target.value)}
            />
            {fieldErrors.linkUrl ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.linkUrl}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Where the headline goes when clicked. Leave blank to show plain text.
              </p>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink dark:text-neutral-100">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setField("active", e.target.checked)}
            />
            Show this headline in the ticker
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
              {submitting
                ? "Saving…"
                : mode === "create"
                  ? "Add Announcement"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
