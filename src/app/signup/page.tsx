"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { FormField, inputClass } from "@/components/FormField";
import { signupSchema } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const [indexNumber, setIndexNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const parsed = signupSchema.safeParse({
      indexNumber,
      firstName,
      lastName,
      password,
    });

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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
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
      title="Create Your Account"
      subtitle="Sign up with your index number to get started. You can complete the rest of your profile afterwards."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold-dark hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          label="Index Number"
          htmlFor="indexNumber"
          error={fieldErrors.indexNumber}
          hint="Starts with 261, e.g. 26103254"
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="First Name"
            htmlFor="firstName"
            error={fieldErrors.firstName}
          >
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              placeholder="Kwame"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Last Name"
            htmlFor="lastName"
            error={fieldErrors.lastName}
          >
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              placeholder="Mensah"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
          hint="At least 8 characters"
        >
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          error={fieldErrors.confirmPassword}
        >
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </FormField>

        {formError && (
          <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthCard>
  );
}
