"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/FormField";
import { PasswordInput } from "@/components/PasswordInput";
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
      const res = await fetch("/api/profile/password", {
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
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-5">
      <FormField
        label="Current Password"
        htmlFor="currentPassword"
        error={fieldErrors.currentPassword}
      >
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="New Password"
          htmlFor="newPassword"
          error={fieldErrors.newPassword}
          hint="At least 8 characters"
        >
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormField>

        <FormField
          label="Confirm New Password"
          htmlFor="confirmPassword"
          error={fieldErrors.confirmPassword}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>
      </div>

      {formError && (
        <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">{formError}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 dark:bg-green-950/40 px-3.5 py-2.5 text-sm text-green-700 dark:text-green-400">{success}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
      >
        {loading ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
