"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { PERMISSIONS } from "@/lib/permissions";
import { adminCreateSchema } from "@/lib/validation";

export type AdminRow = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  permissions: string[];
  active: boolean;
  createdAt: string;
};

export function AdminDialog({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: {
  admin: AdminRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const mode = admin ? "edit" : "create";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form state when the dialog opens for a (possibly new) admin,
  // following React's "adjust state during render" pattern rather than an effect.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = open ? (admin?.id ?? "create") : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setFormError(null);
      setFieldErrors({});
      if (admin) {
        setName(admin.name);
        setEmail(admin.email);
        setPermissions(admin.permissions);
        setPassword("");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setPermissions([]);
      }
    }
  }

  function togglePermission(key: string) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = adminCreateSchema.safeParse({ name, email, password, permissions });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
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
      setLoading(false);
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!admin) return;

    if (!name.trim()) {
      setFieldErrors({ name: "Name is required" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), permissions }),
      });
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
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Admin" : "Edit Admin"}</DialogTitle>
          {mode === "create" && (
            <DialogDescription>
              Create a sub-admin account and choose what they can do.
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={mode === "create" ? handleCreate : handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="adminDialogName">Full Name</Label>
              <Input
                id="adminDialogName"
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adminDialogEmail">Email</Label>
              <Input
                id="adminDialogEmail"
                type="email"
                className="mt-1.5"
                value={email}
                disabled={mode === "edit"}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {mode === "create" && (
            <div>
              <Label htmlFor="adminDialogPassword">Temporary Password</Label>
              <PasswordInput
                id="adminDialogPassword"
                className="mt-1.5"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                At least 8 characters — share this with them to sign in
              </p>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-ink dark:text-neutral-100">Permissions</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PERMISSIONS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-start gap-2.5 rounded-lg border border-black/10 dark:border-white/10 p-3 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(p.key)}
                    onChange={() => togglePermission(p.key)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block font-medium text-ink dark:text-neutral-100">{p.label}</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">{p.description}</span>
                  </span>
                </label>
              ))}
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : mode === "create" ? "Create Admin" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
