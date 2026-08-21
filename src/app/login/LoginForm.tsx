"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { FormField, inputClass } from "@/components/FormField";
import { PasswordInput } from "@/components/PasswordInput";
import { loginSchema } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [indexNumber, setIndexNumber] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ indexNumber, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="STUDENT DIGITAL HUB"
      title="Welcome Back"
      subtitle="Log in with your index number and password."
      footer={
        <>
          New to Knutsford?{" "}
          <Link href="/signup" className="font-semibold text-gold-dark dark:text-gold-light hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Index Number"
          htmlFor="indexNumber"
          error={fieldErrors.indexNumber}
        >
          <input
            id="indexNumber"
            name="indexNumber"
            inputMode="numeric"
            autoComplete="username"
            placeholder="26103254"
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>
    </AuthCard>
  );
}
