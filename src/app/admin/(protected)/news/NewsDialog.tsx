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
import { newsSchema } from "@/lib/validation";

type FormState = {
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  excerpt: "",
  body: "",
  imageUrl: "",
  published: true,
};

export function NewsDialog({
  postId,
  open,
  onOpenChange,
  onSuccess,
}: {
  postId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = postId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (postId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (postId) {
        setLoading(true);
      } else {
        setForm(emptyForm);
      }
    }
  }

  useEffect(() => {
    if (!open || !postId) return;
    fetch(`/api/admin/news/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.post.title,
          excerpt: data.post.excerpt ?? "",
          body: data.post.body ?? "",
          imageUrl: data.post.imageUrl ?? "",
          published: data.post.published,
        });
      })
      .finally(() => setLoading(false));
  }, [open, postId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = newsSchema.safeParse(form);
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
        mode === "create" ? "/api/admin/news" : `/api/admin/news/${postId}`,
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
          <DialogTitle>{mode === "create" ? "New Post" : "Edit Post"}</DialogTitle>
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
              <Label htmlFor="np-title">Title</Label>
              <Input
                id="np-title"
                className="mt-1.5"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="np-excerpt">Excerpt</Label>
              <Textarea
                id="np-excerpt"
                className="mt-1.5"
                rows={2}
                placeholder="A short summary shown on the news list"
                value={form.excerpt}
                onChange={(e) => setField("excerpt", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="np-body">Body</Label>
              <Textarea
                id="np-body"
                className="mt-1.5"
                rows={8}
                value={form.body}
                onChange={(e) => setField("body", e.target.value)}
              />
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
                {submitting ? "Saving…" : mode === "create" ? "Publish Post" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
