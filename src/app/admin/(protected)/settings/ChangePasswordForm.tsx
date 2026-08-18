"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { changePasswordSchema } from "@/lib/validation";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
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
      const res = await fetch("/api/admin/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(
        data.emailSent
          ? "Password changed. A confirmation email has been sent to your inbox."
          : "Password changed."
      );
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <PasswordInput
          id="currentPassword"
          className="mt-1.5"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        {fieldErrors.currentPassword && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.currentPassword}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <PasswordInput
            id="newPassword"
            className="mt-1.5"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {fieldErrors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <PasswordInput
            id="confirmPassword"
            className="mt-1.5"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      </div>

      {formError && (
        <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{formError}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{success}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
