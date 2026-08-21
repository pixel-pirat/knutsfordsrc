"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { FormField, inputClass } from "@/components/FormField";
import { PasswordInput } from "@/components/PasswordInput";
import { adminLoginSchema, adminBootstrapSchema } from "@/lib/validation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/bootstrap")
      .then((res) => res.json())
      .then((data) => setNeedsBootstrap(Boolean(data?.needsBootstrap)))
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, []);

  async function handleBootstrap(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const parsed = adminBootstrapSchema.safeParse({ name, email, password });
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
      const res = await fetch("/api/admin/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = adminLoginSchema.safeParse({ email, password });
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
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      const next = searchParams.get("next") ?? "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <AuthCard eyebrow="SRC EXECUTIVE PORTAL" title="Loading…" subtitle="" footer={null}>
        <div />
      </AuthCard>
    );
  }

  if (needsBootstrap) {
    return (
      <AuthCard
        eyebrow="SRC EXECUTIVE PORTAL · FIRST-TIME SETUP"
        title="Create the Super Admin Account"
        subtitle="No admin account exists yet. Set one up now — it will have full control of the system."
        footer={null}
      >
        <form onSubmit={handleBootstrap} noValidate className="space-y-5">
          <FormField label="Full Name" htmlFor="name" error={fieldErrors.name}>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ama Owusu"
            />
          </FormField>
          <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@knutsford.edu.gh"
            />
          </FormField>
          <FormField label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters">
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>
          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={fieldErrors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>

          {formError && (
            <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
          >
            {loading ? "Creating account…" : "Create Super Admin Account"}
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="SRC EXECUTIVE PORTAL"
      title="Admin Sign In"
      subtitle="Sign in with your executive email and password."
      footer={null}
    >
      <form onSubmit={handleLogin} noValidate className="space-y-5">
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="admin@knutsford.edu.gh"
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={fieldErrors.password}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FormField>

        {formError && (
          <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </AuthCard>
  );
}
