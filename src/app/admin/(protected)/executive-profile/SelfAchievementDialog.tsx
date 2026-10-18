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
import { ImageUpload } from "@/components/ImageUpload";
import { executiveSelfAchievementSchema } from "@/lib/validation";

export type SelfAchievement = {
  id: string;
  title: string;
  description: string | null;
  achievedAt: string | null;
  imageUrl: string | null;
};

type FormState = {
  title: string;
  description: string;
  achievedAt: string;
  imageUrl: string;
};

function toForm(achievement: SelfAchievement | null): FormState {
  return {
    title: achievement?.title ?? "",
    description: achievement?.description ?? "",
    achievedAt: achievement?.achievedAt ? achievement.achievedAt.slice(0, 10) : "",
    imageUrl: achievement?.imageUrl ?? "",
  };
}

export function SelfAchievementDialog({
  achievement,
  open,
  onOpenChange,
  onSuccess,
}: {
  achievement: SelfAchievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = achievement ? "edit" : "create";
  const [form, setForm] = useState<FormState>(() => toForm(achievement));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (achievement?.id ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      setForm(toForm(achievement));
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = executiveSelfAchievementSchema.safeParse(form);
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
        mode === "create" ? "/api/executive/achievements" : `/api/executive/achievements/${achievement!.id}`,
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
          <DialogTitle>{mode === "create" ? "New Achievement" : "Edit Achievement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            imageUrl={form.imageUrl}
            onUploaded={(url) => setField("imageUrl", url)}
            onRemove={() => setField("imageUrl", "")}
          />

          <div>
            <Label htmlFor="sa-title">Title</Label>
            <Input
              id="sa-title"
              className="mt-1.5"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="sa-description">Description</Label>
            <Textarea
              id="sa-description"
              className="mt-1.5"
              rows={4}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="sa-date">Date</Label>
            <Input
              id="sa-date"
              type="date"
              className="mt-1.5 max-w-48"
              value={form.achievedAt}
              onChange={(e) => setField("achievedAt", e.target.value)}
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
              {submitting ? "Saving…" : mode === "create" ? "Add Achievement" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
