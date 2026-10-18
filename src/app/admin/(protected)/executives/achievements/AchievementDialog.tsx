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
import { executiveAchievementSchema } from "@/lib/validation";

type FormState = {
  yearGroupId: string;
  profileId: string;
  title: string;
  description: string;
  achievedAt: string;
  imageUrl: string;
};

function emptyForm(defaultYearGroupId: string): FormState {
  return {
    yearGroupId: defaultYearGroupId,
    profileId: "",
    title: "",
    description: "",
    achievedAt: "",
    imageUrl: "",
  };
}

export function AchievementDialog({
  achievementId,
  defaultYearGroupId,
  yearGroups,
  profiles,
  open,
  onOpenChange,
  onSuccess,
}: {
  achievementId: string | null;
  defaultYearGroupId: string;
  yearGroups: { id: string; label: string }[];
  profiles: { id: string; name: string; yearGroupId: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = achievementId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(defaultYearGroupId));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (achievementId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (achievementId) {
        setLoading(true);
      } else {
        setForm(emptyForm(defaultYearGroupId));
      }
    }
  }

  useEffect(() => {
    if (!open || !achievementId) return;
    fetch(`/api/admin/executives/achievements/${achievementId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          yearGroupId: data.achievement.yearGroupId,
          profileId: data.achievement.profileId ?? "",
          title: data.achievement.title,
          description: data.achievement.description ?? "",
          achievedAt: data.achievement.achievedAt
            ? data.achievement.achievedAt.slice(0, 10)
            : "",
          imageUrl: data.achievement.imageUrl ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [open, achievementId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const profilesInYearGroup = profiles.filter((p) => p.yearGroupId === form.yearGroupId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = executiveAchievementSchema.safeParse(form);
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
          ? "/api/admin/executives/achievements"
          : `/api/admin/executives/achievements/${achievementId}`,
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

        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              imageUrl={form.imageUrl}
              onUploaded={(url) => setField("imageUrl", url)}
              onRemove={() => setField("imageUrl", "")}
            />

            <div>
              <Label>Year Group</Label>
              <Select
                value={form.yearGroupId}
                onValueChange={(v) => {
                  setField("yearGroupId", v ?? "");
                  setField("profileId", "");
                }}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select year group" />
                </SelectTrigger>
                <SelectContent>
                  {yearGroups.map((yg) => (
                    <SelectItem key={yg.id} value={yg.id}>
                      {yg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.yearGroupId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.yearGroupId}</p>
              )}
            </div>

            <div>
              <Label>Credit to</Label>
              <Select
                value={form.profileId || "batch"}
                onValueChange={(v) => setField("profileId", v === "batch" ? "" : (v ?? ""))}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Whole year group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Whole year group</SelectItem>
                  {profilesInYearGroup.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ea-title">Title</Label>
              <Input
                id="ea-title"
                className="mt-1.5"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ea-description">Description</Label>
              <Textarea
                id="ea-description"
                className="mt-1.5"
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ea-date">Date</Label>
              <Input
                id="ea-date"
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
                {submitting ? "Saving…" : mode === "create" ? "Create Achievement" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
