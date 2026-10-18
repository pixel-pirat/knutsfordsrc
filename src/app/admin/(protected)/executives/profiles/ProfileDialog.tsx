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
import { AvatarUpload } from "@/components/AvatarUpload";
import { executiveProfileSchema } from "@/lib/validation";

const SOCIAL_KEYS = ["twitter", "instagram", "facebook", "linkedin", "tiktok"] as const;

type FormState = {
  yearGroupId: string;
  name: string;
  position: string;
  bio: string;
  avatarUrl: string;
  socialLinks: Record<string, string>;
  adminUserId: string;
  displayOrder: number;
};

function emptyForm(defaultYearGroupId: string): FormState {
  return {
    yearGroupId: defaultYearGroupId,
    name: "",
    position: "",
    bio: "",
    avatarUrl: "",
    socialLinks: {},
    adminUserId: "",
    displayOrder: 0,
  };
}

export function ProfileDialog({
  profileId,
  defaultYearGroupId,
  yearGroups,
  admins,
  open,
  onOpenChange,
  onSuccess,
}: {
  profileId: string | null;
  defaultYearGroupId: string;
  yearGroups: { id: string; label: string }[];
  admins: { id: string; name: string; email: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = profileId ? "edit" : "create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(defaultYearGroupId));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (profileId ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (profileId) {
        setLoading(true);
      } else {
        setForm(emptyForm(defaultYearGroupId));
      }
    }
  }

  useEffect(() => {
    if (!open || !profileId) return;
    fetch(`/api/admin/executives/profiles/${profileId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          yearGroupId: data.profile.yearGroupId,
          name: data.profile.name,
          position: data.profile.position,
          bio: data.profile.bio ?? "",
          avatarUrl: data.profile.avatarUrl ?? "",
          socialLinks: data.profile.socialLinks ?? {},
          adminUserId: data.profile.adminUserId ?? "",
          displayOrder: data.profile.displayOrder,
        });
      })
      .finally(() => setLoading(false));
  }, [open, profileId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const cleanedLinks = Object.fromEntries(
      Object.entries(form.socialLinks).filter(([, v]) => v.trim())
    );
    const parsed = executiveProfileSchema.safeParse({ ...form, socialLinks: cleanedLinks });
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
          ? "/api/admin/executives/profiles"
          : `/api/admin/executives/profiles/${profileId}`,
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
          <DialogTitle>{mode === "create" ? "New Executive Profile" : "Edit Profile"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AvatarUpload
              name={form.name || "?"}
              avatarUrl={form.avatarUrl}
              onUploaded={(url) => setField("avatarUrl", url)}
            />

            <div>
              <Label>Year Group</Label>
              <Select value={form.yearGroupId} onValueChange={(v) => setField("yearGroupId", v ?? "")}>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ep-name">Name</Label>
                <Input
                  id="ep-name"
                  className="mt-1.5"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="ep-position">Position</Label>
                <Input
                  id="ep-position"
                  className="mt-1.5"
                  placeholder="e.g. President"
                  value={form.position}
                  onChange={(e) => setField("position", e.target.value)}
                />
                {fieldErrors.position && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.position}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="ep-bio">Bio</Label>
              <Textarea
                id="ep-bio"
                className="mt-1.5"
                rows={3}
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
              />
            </div>

            <div>
              <Label>Social Links</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                {SOCIAL_KEYS.map((key) => (
                  <Input
                    key={key}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={form.socialLinks[key] ?? ""}
                    onChange={(e) =>
                      setField("socialLinks", { ...form.socialLinks, [key]: e.target.value })
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Linked Admin Account</Label>
              <Select
                value={form.adminUserId || "none"}
                onValueChange={(v) => setField("adminUserId", v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (no login, archived/past executive)</SelectItem>
                  {admins.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                If linked, this person can edit their own bio and achievements from their Settings.
              </p>
            </div>

            <div>
              <Label htmlFor="ep-order">Display Order</Label>
              <Input
                id="ep-order"
                type="number"
                min={0}
                className="mt-1.5 max-w-32"
                value={form.displayOrder}
                onChange={(e) => setField("displayOrder", Number(e.target.value) || 0)}
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
                {submitting ? "Saving…" : mode === "create" ? "Create Profile" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
